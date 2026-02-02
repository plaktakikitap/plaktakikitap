import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { ContentItem, Film, Series, Book, Translation } from "@/types/database";

// --- Schemas ---

const visibilitySchema = z.enum(["public", "unlisted", "private"]);
const ratingSchema = z.number().min(0).max(10).optional().nullable();

export const createFilmSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  rating: ratingSchema,
  visibility: visibilitySchema.default("public"),
  duration_min: z.number().int().positive("Süre gerekli"),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  poster_url: z
    .union([z.literal(""), z.string().url()])
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)),
  review: z.string().optional().nullable(),
});

export const createSeriesSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  rating: ratingSchema,
  visibility: visibilitySchema.default("public"),
  avg_episode_min: z.number().int().positive().optional().nullable(),
  episodes_watched: z.number().int().min(0).default(0),
  seasons_watched: z.number().int().min(0).default(0),
  review: z.string().optional().nullable(),
});

export const createBookSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  rating: ratingSchema,
  visibility: visibilitySchema.default("public"),
  pages: z.number().int().positive().optional().nullable(),
  author: z.string().optional().nullable(),
  quote: z.string().optional().nullable(),
  review: z.string().optional().nullable(),
  cover_url: z
    .union([z.literal(""), z.string().url()])
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)),
});

export type CreateFilmInput = z.infer<typeof createFilmSchema>;
export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;

export interface CinemaStats {
  totalFilms: number;
  totalSeries: number;
  totalWatchTimeMinutes: number;
  totalReviews: number;
}

// --- Helpers ---

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}


// --- Public queries ---

export async function getPublicFilms(): Promise<
  (ContentItem & { film: Film | Film[] | null })[]
> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*, film:films(*)")
    .eq("type", "film")
    .in("visibility", ["public", "unlisted"])
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as (ContentItem & { film: Film | Film[] | null })[];
}

export async function getPublicSeries(): Promise<
  (ContentItem & { series: Series | Series[] | null })[]
> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*, series:series(*)")
    .eq("type", "series")
    .in("visibility", ["public", "unlisted"])
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as (ContentItem & { series: Series | Series[] | null })[];
}

export async function getPublicBooks(): Promise<
  (ContentItem & { book: Book | Book[] | null })[]
> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*, book:books(*)")
    .eq("type", "book")
    .in("visibility", ["public", "unlisted"])
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as (ContentItem & { book: Book | Book[] | null })[];
}

export interface ArtItem {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  visibility: string;
  media: { id: string; kind: string; url: string; caption: string | null }[];
}

/** Art listing: only public. Unlisted items are accessible via direct link only. */
export async function getPublicArt(): Promise<ArtItem[]> {
  const supabase = await createServerClient();
  const { data: items, error } = await supabase
    .from("content_items")
    .select("id, title, slug, description, visibility")
    .eq("type", "art")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });
  if (error) return [];

  const result: ArtItem[] = [];
  for (const item of items ?? []) {
    const { data: media } = await supabase
      .from("media_assets")
      .select("id, kind, url, caption")
      .eq("content_id", item.id);
    result.push({ ...item, media: media ?? [] });
  }
  return result;
}

/** Fetch single art item by slug or id — supports unlisted (direct link) access. */
export async function getArtBySlug(slugOrId: string): Promise<ArtItem | null> {
  const supabase = await createServerClient();
  const isUuid = /^[0-9a-f-]{36}$/i.test(slugOrId);
  let query = supabase
    .from("content_items")
    .select("id, title, slug, description, visibility")
    .eq("type", "art")
    .in("visibility", ["public", "unlisted"]);
  query = isUuid ? query.eq("id", slugOrId) : query.eq("slug", slugOrId);
  const { data: item, error } = await query.single();
  if (error || !item) return null;

  const { data: media } = await supabase
    .from("media_assets")
    .select("id, kind, url, caption")
    .eq("content_id", item.id);

  return { ...item, media: media ?? [] };
}

export async function getAdminMediaAssets(): Promise<
  { id: string; content_id: string | null; kind: string; url: string; caption: string | null }[]
> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, content_id, kind, url, caption")
    .order("id", { ascending: false });
  if (error) return [];
  return data ?? [];
}

/** Public posts — title only for preview. */
export async function getPublicPosts(limit = 5): Promise<{ id: string; title: string }[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("id, title")
    .eq("type", "post")
    .in("visibility", ["public", "unlisted"])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as { id: string; title: string }[];
}

/** Public projects count. */
export async function getPublicProjectsCount(): Promise<number> {
  const supabase = await createServerClient();
  const { count, error } = await supabase
    .from("content_items")
    .select("*", { count: "exact", head: true })
    .eq("type", "project")
    .in("visibility", ["public", "unlisted"]);
  if (error) return 0;
  return count ?? 0;
}

export async function getPublicTranslations(): Promise<
  (ContentItem & { translation: Translation | Translation[] | null })[]
> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*, translation:translations(*)")
    .eq("type", "translation")
    .in("visibility", ["public", "unlisted"])
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as (ContentItem & { translation: Translation | Translation[] | null })[];
}

export interface PlannerEntryWithMedia {
  id: string;
  date: string;
  title: string | null;
  body: string | null;
  media: { id: string; kind: string; url: string; caption: string | null }[];
}

/** Last N planner entries (public/unlisted). For home preview. */
export async function getRecentPlannerEntries(limit = 5): Promise<PlannerEntryWithMedia[]> {
  const supabase = await createServerClient();
  const { data: entries, error } = await supabase
    .from("planner_entries")
    .select("id, date, title, body")
    .in("visibility", ["public", "unlisted"])
    .order("date", { ascending: false })
    .limit(limit);

  if (error) return [];

  const result: PlannerEntryWithMedia[] = [];
  for (const e of entries ?? []) {
    const { data: media } = await supabase
      .from("planner_media")
      .select("id, kind, url, caption")
      .eq("planner_entry_id", e.id);
    result.push({ ...e, media: media ?? [] });
  }
  return result;
}

/** Entries for a month (for highlights list). Public sees only public/unlisted. */
export async function getPlannerEntriesByMonth(
  year: number,
  month: number
): Promise<PlannerEntryWithMedia[]> {
  const supabase = await createServerClient();
  const m = month + 1; // JS month 0–11 → 1–12
  const start = `${year}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data: entries, error } = await supabase
    .from("planner_entries")
    .select("id, date, title, body")
    .in("visibility", ["public", "unlisted"])
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (error) return [];

  const result: PlannerEntryWithMedia[] = [];
  for (const e of entries ?? []) {
    const { data: media } = await supabase
      .from("planner_media")
      .select("id, kind, url, caption")
      .eq("planner_entry_id", e.id);
    result.push({ ...e, media: media ?? [] });
  }
  return result;
}

/** Admin: all planner entries including private. */
export async function getAdminPlannerEntries(): Promise<
  (PlannerEntryWithMedia & { visibility: string })[]
> {
  const supabase = await createServerClient();
  const { data: entries, error } = await supabase
    .from("planner_entries")
    .select("id, date, title, body, visibility")
    .order("date", { ascending: false });

  if (error) return [];

  const result: (PlannerEntryWithMedia & { visibility: string })[] = [];
  for (const e of entries ?? []) {
    const { data: media } = await supabase
      .from("planner_media")
      .select("id, kind, url, caption")
      .eq("planner_entry_id", e.id);
    result.push({ ...e, media: media ?? [] });
  }
  return result;
}

export async function getPlannerEntriesByDate(
  dateStr: string
): Promise<PlannerEntryWithMedia[]> {
  const supabase = await createServerClient();
  const { data: entry, error } = await supabase
    .from("planner_entries")
    .select("id, date, title, body")
    .eq("date", dateStr)
    .in("visibility", ["public", "unlisted"])
    .single();

  if (error || !entry) return [];

  const { data: media } = await supabase
    .from("planner_media")
    .select("id, kind, url, caption")
    .eq("planner_entry_id", entry.id);

  return [
    {
      id: entry.id,
      date: entry.date,
      title: entry.title,
      body: entry.body,
      media: media ?? [],
    },
  ];
}

export type RecentItem =
  | { type: "film"; item: ContentItem & { film: Film | Film[] | null } }
  | { type: "series"; item: ContentItem & { series: Series | Series[] | null } }
  | { type: "book"; item: ContentItem & { book: Book | Book[] | null } };

export async function getAdminRecentItems(limit = 15): Promise<RecentItem[]> {
  const [films, series, books] = await Promise.all([
    getAdminFilms(),
    getAdminSeries(),
    getAdminBooks(),
  ]);

  const items: RecentItem[] = [
    ...films.map((item) => ({ type: "film" as const, item })),
    ...series.map((item) => ({ type: "series" as const, item })),
    ...books.map((item) => ({ type: "book" as const, item })),
  ];

  items.sort(
    (a, b) =>
      new Date(b.item.created_at).getTime() -
      new Date(a.item.created_at).getTime()
  );

  return items.slice(0, limit);
}

async function getAdminFilms() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*, film:films(*)")
    .eq("type", "film")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as (ContentItem & { film: Film | Film[] | null })[];
}

async function getAdminSeries() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*, series:series(*)")
    .eq("type", "series")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as (ContentItem & { series: Series | Series[] | null })[];
}

async function getAdminBooks() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*, book:books(*)")
    .eq("type", "book")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as (ContentItem & { book: Book | Book[] | null })[];
}

export async function deleteContentItem(
  id: string,
  type: "film" | "series" | "book"
) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/cinema");
  revalidatePath("/books");
  revalidatePath("/admin");
  revalidatePath(`/admin/${type}s`);
  return { success: true };
}

const DEFAULT_CINEMA_STATS: CinemaStats = {
  totalFilms: 0,
  totalSeries: 0,
  totalWatchTimeMinutes: 0,
  totalReviews: 0,
};

export async function getCinemaStats(): Promise<CinemaStats> {
  try {
    const supabase = await createServerClient();
  const vis = ["public", "unlisted"];

  const [filmsRes, seriesRes] = await Promise.all([
    supabase
      .from("content_items")
      .select("id")
      .eq("type", "film")
      .in("visibility", vis),
    supabase
      .from("content_items")
      .select("id")
      .eq("type", "series")
      .in("visibility", vis),
  ]);

  const films = filmsRes.data ?? [];
  const series = seriesRes.data ?? [];
  let totalWatchTimeMinutes = 0;
  let totalReviews = 0;

  for (const f of films) {
    const { data: film } = await supabase
      .from("films")
      .select("duration_min, review")
      .eq("content_id", f.id)
      .single();
    if (film?.duration_min) totalWatchTimeMinutes += film.duration_min;
    if (film?.review) totalReviews++;
  }

  for (const s of series) {
    const { data: ser } = await supabase
      .from("series")
      .select("avg_episode_min, episodes_watched, review")
      .eq("content_id", s.id)
      .single();
    if (ser) {
      totalWatchTimeMinutes +=
        (ser.avg_episode_min ?? 0) * (ser.episodes_watched ?? 0);
      if (ser.review) totalReviews++;
    }
  }

  return {
    totalFilms: films.length,
    totalSeries: series.length,
    totalWatchTimeMinutes,
    totalReviews,
  };
  } catch {
    return DEFAULT_CINEMA_STATS;
  }
}

// --- Admin mutations ---

export async function createFilm(
  input: CreateFilmInput | z.infer<typeof createFilmSchema>
) {
  const parsed = createFilmSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(", ") };
  }
  const data = parsed.data;

  const supabase = await createServerClient();
  const slug = data.slug?.trim()
    ? slugify(data.slug)
    : slugify(data.title) + "-" + Date.now();

  const { data: content, error: contentError } = await supabase
    .from("content_items")
    .insert({
      type: "film",
      title: data.title,
      slug,
      description: data.description || null,
      rating: data.rating ?? null,
      visibility: data.visibility,
    })
    .select("id")
    .single();

  if (contentError) return { error: contentError.message };
  if (!content) return { error: "Failed to create content" };

  const { error: filmError } = await supabase.from("films").insert({
    content_id: content.id,
    duration_min: data.duration_min,
    year: data.year ?? null,
    poster_url: data.poster_url ?? null,
    review: data.review || null,
  });

  if (filmError) return { error: filmError.message };

  revalidatePath("/");
  revalidatePath("/cinema");
  revalidatePath("/admin");
  revalidatePath("/admin/films");
  return { success: true, id: content.id };
}

export async function createSeries(
  input: CreateSeriesInput | z.infer<typeof createSeriesSchema>
) {
  const parsed = createSeriesSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(", ") };
  }
  const data = parsed.data;

  const supabase = await createServerClient();
  const slug = data.slug?.trim()
    ? slugify(data.slug)
    : slugify(data.title) + "-" + Date.now();

  const { data: content, error: contentError } = await supabase
    .from("content_items")
    .insert({
      type: "series",
      title: data.title,
      slug,
      description: data.description || null,
      rating: data.rating ?? null,
      visibility: data.visibility,
    })
    .select("id")
    .single();

  if (contentError) return { error: contentError.message };
  if (!content) return { error: "Failed to create content" };

  const { error: seriesError } = await supabase.from("series").insert({
    content_id: content.id,
    avg_episode_min: data.avg_episode_min ?? null,
    episodes_watched: data.episodes_watched,
    seasons_watched: data.seasons_watched,
    review: data.review || null,
  });

  if (seriesError) return { error: seriesError.message };

  revalidatePath("/");
  revalidatePath("/cinema");
  revalidatePath("/admin");
  revalidatePath("/admin/series");
  return { success: true, id: content.id };
}

export async function createBook(
  input: CreateBookInput | z.infer<typeof createBookSchema>
) {
  const parsed = createBookSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(", ") };
  }
  const data = parsed.data;

  const supabase = await createServerClient();
  const slug = data.slug?.trim()
    ? slugify(data.slug)
    : slugify(data.title) + "-" + Date.now();

  const { data: content, error: contentError } = await supabase
    .from("content_items")
    .insert({
      type: "book",
      title: data.title,
      slug,
      description: data.description || null,
      rating: data.rating ?? null,
      visibility: data.visibility,
    })
    .select("id")
    .single();

  if (contentError) return { error: contentError.message };
  if (!content) return { error: "Failed to create content" };

  const { error: bookError } = await supabase.from("books").insert({
    content_id: content.id,
    pages: data.pages ?? null,
    author: data.author || null,
    quote: data.quote || null,
    review: data.review || null,
    cover_url: data.cover_url ?? null,
  });

  if (bookError) return { error: bookError.message };

  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
  return { success: true, id: content.id };
}

// --- Planner (admin) ---

export async function createPlannerEntry(input: {
  date: string;
  title?: string | null;
  body?: string | null;
  visibility?: "public" | "unlisted" | "private";
}) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("planner_entries")
    .insert({
      date: input.date,
      title: input.title?.trim() || null,
      body: input.body?.trim() || null,
      visibility: input.visibility ?? "private",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/planner");
  revalidatePath("/admin/planner");
  return { success: true, id: data.id };
}

export async function updatePlannerEntry(
  id: string,
  input: {
    date?: string;
    title?: string | null;
    body?: string | null;
    visibility?: "public" | "unlisted" | "private";
  }
) {
  const supabase = await createServerClient();
  const updates: Record<string, unknown> = {};
  if (input.date != null) updates.date = input.date;
  if (input.title !== undefined) updates.title = input.title?.trim() || null;
  if (input.body !== undefined) updates.body = input.body?.trim() || null;
  if (input.visibility != null) updates.visibility = input.visibility;
  const { error } = await supabase
    .from("planner_entries")
    .update(updates)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/planner");
  revalidatePath("/admin/planner");
  return { success: true };
}

export async function deletePlannerEntry(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("planner_entries").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/planner");
  revalidatePath("/admin/planner");
  return { success: true };
}

export async function addPlannerMedia(input: {
  planner_entry_id: string;
  kind: "image" | "video" | "link";
  url: string;
  caption?: string | null;
}) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("planner_media").insert({
    planner_entry_id: input.planner_entry_id,
    kind: input.kind,
    url: input.url.trim(),
    caption: input.caption?.trim() || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/planner");
  revalidatePath("/admin/planner");
  return { success: true };
}

export async function deletePlannerMedia(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("planner_media").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/planner");
  revalidatePath("/admin/planner");
  return { success: true };
}

// --- Art (admin) ---

export async function createArt(input: {
  title: string;
  slug?: string | null;
  description?: string | null;
  visibility?: "public" | "unlisted" | "private";
}) {
  const supabase = await createServerClient();
  const slug = input.slug?.trim()
    ? slugify(input.slug)
    : slugify(input.title) + "-" + Date.now();
  const { data, error } = await supabase
    .from("content_items")
    .insert({
      type: "art",
      title: input.title.trim(),
      slug,
      description: input.description?.trim() || null,
      visibility: input.visibility ?? "public",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/art");
  revalidatePath("/admin/art");
  return { success: true, id: data.id };
}

export async function getAdminArt(): Promise<ArtItem[]> {
  const supabase = await createServerClient();
  const { data: items, error } = await supabase
    .from("content_items")
    .select("id, title, slug, description, visibility")
    .eq("type", "art")
    .order("created_at", { ascending: false });
  if (error) return [];

  const result: ArtItem[] = [];
  for (const item of items ?? []) {
    const { data: media } = await supabase
      .from("media_assets")
      .select("id, kind, url, caption")
      .eq("content_id", item.id);
    result.push({ ...item, media: media ?? [] });
  }
  return result;
}

export async function updateArt(
  id: string,
  input: {
    title?: string;
    slug?: string | null;
    description?: string | null;
    visibility?: "public" | "unlisted" | "private";
  }
) {
  const supabase = await createServerClient();
  const updates: Record<string, unknown> = {};
  if (input.title != null) updates.title = input.title.trim();
  if (input.slug !== undefined) {
    const s = input.slug?.trim();
    updates.slug = s ? slugify(s) : (input.title ? slugify(input.title) : "art") + "-" + Date.now();
  }
  if (input.description !== undefined) updates.description = input.description?.trim() || null;
  if (input.visibility != null) updates.visibility = input.visibility;
  const { error } = await supabase.from("content_items").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/art");
  revalidatePath("/admin/art");
  return { success: true };
}

export async function deleteArt(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/art");
  revalidatePath("/admin/art");
  return { success: true };
}

export async function addArtMedia(input: {
  content_id: string;
  kind: "image" | "video" | "link";
  url: string;
  caption?: string | null;
}) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("media_assets").insert({
    content_id: input.content_id,
    kind: input.kind,
    url: input.url.trim(),
    caption: input.caption?.trim() || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/art");
  revalidatePath("/admin/art");
  return { success: true };
}

export async function deleteArtMedia(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/art");
  revalidatePath("/admin/art");
  return { success: true };
}
