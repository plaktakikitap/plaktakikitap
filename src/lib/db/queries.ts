import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { ContentItem, Film, Series, Book, Translation } from "@/types/database";

// --- Schemas ---

const visibilitySchema = z.enum(["public", "unlisted", "private"]);
const ratingSchema = z.number().min(0).max(10).optional().nullable();
/** 0-5, 0.25 adımları (çeyrek/yarım yıldız) */
const rating5Schema = z
  .number()
  .min(0)
  .max(5)
  .multipleOf(0.25)
  .optional()
  .nullable();

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
  spine_url: z
    .union([z.literal(""), z.string().url()])
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)),
  review: z.string().optional().nullable(),
  director: z.string().optional().nullable().transform((v) => (v && v.trim() ? v.trim() : null)),
  genre_tags: z.array(z.string()).optional().default([]),
  rating_5: rating5Schema,
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
  pages: z.number().int().positive("Sayfa sayısı gerekli"),
  author: z.string().optional().nullable().transform((v) => (v && v.trim() ? v.trim() : "")),
  quote: z.string().optional().nullable(),
  review: z.string().optional().nullable(),
  cover_url: z
    .union([z.literal(""), z.string().url()])
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)),
  spine_url: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v.trim() : "")),
});

export type CreateFilmInput = z.infer<typeof createFilmSchema>;
export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;

export interface CinemaStats {
  totalFilms: number;
  totalSeries: number;
  /** Toplam film süresi (dakika) */
  totalFilmWatchTimeMinutes: number;
  /** Toplam dizi izleme süresi (dakika) */
  totalSeriesWatchTimeMinutes: number;
  /** Film + dizi toplam süre (geriye uyumluluk) */
  totalWatchTimeMinutes: number;
  totalReviews: number;
  /** Bu ay (watched_at) izlenen film sayısı */
  filmWatchedThisMonth: number;
  /** Bu ay (watched_at) izlenen dizi sayısı */
  seriesWatchedThisMonth: number;
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

function getFilmWatchedAt(item: ContentItem & { film: Film | Film[] | null }): string {
  const f = item.film;
  const film = Array.isArray(f) ? f[0] : f;
  return (film as { watched_at?: string | null })?.watched_at ?? item.created_at;
}

export async function getPublicFilms(): Promise<
  (ContentItem & { film: Film | Film[] | null })[]
> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*, film:films(*)")
    .eq("type", "film")
    .in("visibility", ["public", "unlisted"]);

  if (error) return [];
  const list = (data ?? []) as (ContentItem & { film: Film | Film[] | null })[];
  list.sort((a, b) => new Date(getFilmWatchedAt(a)).getTime() - new Date(getFilmWatchedAt(b)).getTime());
  return list;
}

function getSeriesWatchedAt(item: ContentItem & { series: Series | Series[] | null }): string {
  const s = item.series;
  const series = Array.isArray(s) ? s[0] : s;
  return (series as { watched_at?: string | null })?.watched_at ?? item.created_at;
}

export async function getPublicSeries(): Promise<
  (ContentItem & { series: Series | Series[] | null })[]
> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*, series:series(*)")
    .eq("type", "series")
    .in("visibility", ["public", "unlisted"]);

  if (error) return [];
  const list = (data ?? []) as (ContentItem & { series: Series | Series[] | null })[];
  list.sort((a, b) => new Date(getSeriesWatchedAt(a)).getTime() - new Date(getSeriesWatchedAt(b)).getTime());
  return list;
}

/** En son işaretlenen 5 favori film (VIP vitrin için). */
export async function getPublicFavoriteFilms(): Promise<
  (ContentItem & { film: Film | Film[] | null })[]
> {
  const supabase = await createServerClient();
  const { data: filmsRows, error: filmsErr } = await supabase
    .from("films")
    .select("*")
    .eq("is_favorite", true)
    .order("favorite_order", { ascending: false, nullsFirst: false })
    .limit(5);
  if (filmsErr || !filmsRows?.length) return [];
  const contentIds = filmsRows.map((f) => f.content_id);
  const { data: items, error: itemsErr } = await supabase
    .from("content_items")
    .select("*")
    .in("id", contentIds)
    .in("visibility", ["public", "unlisted"]);
  if (itemsErr || !items?.length) return [];
  const itemMap = new Map(items.map((i) => [i.id, i]));
  const result: (ContentItem & { film: Film | Film[] | null })[] = [];
  for (const film of filmsRows) {
    const content = itemMap.get(film.content_id);
    if (content) result.push({ ...content, film });
  }
  return result;
}

/** En son işaretlenen 5 favori dizi (VIP vitrin için). */
export async function getPublicFavoriteSeries(): Promise<
  (ContentItem & { series: Series | Series[] | null })[]
> {
  const supabase = await createServerClient();
  const { data: seriesRows, error: seriesErr } = await supabase
    .from("series")
    .select("*")
    .eq("is_favorite", true)
    .order("favorite_order", { ascending: false, nullsFirst: false })
    .limit(5);
  if (seriesErr || !seriesRows?.length) return [];
  const contentIds = seriesRows.map((s) => s.content_id);
  const { data: items, error: itemsErr } = await supabase
    .from("content_items")
    .select("*")
    .in("id", contentIds)
    .in("visibility", ["public", "unlisted"]);
  if (itemsErr || !items?.length) return [];
  const itemMap = new Map(items.map((i) => [i.id, i]));
  const result: (ContentItem & { series: Series | Series[] | null })[] = [];
  for (const seriesRow of seriesRows) {
    const content = itemMap.get(seriesRow.content_id);
    if (content) result.push({ ...content, series: seriesRow });
  }
  return result;
}

/** Public/unlisted books from standalone books table (reading log). */
export async function getPublicBooks(): Promise<Book[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .in("visibility", ["public", "unlisted"])
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as Book[];
}

/** Single book by id (admin edit). */
export async function getBookById(id: string): Promise<Book | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("books").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as Book;
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

/** Total books in catalog (admin stats). */
export async function getTotalBooksCount(): Promise<number> {
  const supabase = await createServerClient();
  const { count, error } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

/** Bu ay bitirilen kitap sayısı (status=finished, end_date bu ay). */
export async function getBooksReadThisMonth(): Promise<number> {
  const supabase = await createServerClient();
  const now = new Date();
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const endOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const { count, error } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true })
    .eq("status", "finished")
    .gte("end_date", startOfMonth)
    .lte("end_date", endOfMonth);
  if (error) return 0;
  return count ?? 0;
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
  created_at?: string;
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
    .select("id, date, title, body, created_at")
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
    .select("id, date, title, body, created_at")
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
      created_at: entry.created_at,
      media: media ?? [],
    },
  ];
}

export type RecentItem =
  | { type: "film"; item: ContentItem & { film: Film | Film[] | null } }
  | { type: "series"; item: ContentItem & { series: Series | Series[] | null } }
  | { type: "book"; item: Book };

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

async function getAdminBooks(): Promise<Book[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Book[];
}

export async function deleteContentItem(
  id: string,
  type: "film" | "series" | "book"
) {
  const supabase = await createServerClient();
  if (type === "book") {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("content_items").delete().eq("id", id);
    if (error) return { error: error.message };
  }
  revalidatePath("/");
  revalidatePath("/cinema");
  revalidatePath("/books");
  revalidatePath("/okuma-gunlugum");
  revalidatePath("/admin");
  revalidatePath(`/admin/${type}s`);
  return { success: true };
}

const DEFAULT_CINEMA_STATS: CinemaStats = {
  totalFilms: 0,
  totalSeries: 0,
  totalFilmWatchTimeMinutes: 0,
  totalSeriesWatchTimeMinutes: 0,
  totalWatchTimeMinutes: 0,
  totalReviews: 0,
  filmWatchedThisMonth: 0,
  seriesWatchedThisMonth: 0,
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
  let totalFilmWatchTimeMinutes = 0;
  let totalSeriesWatchTimeMinutes = 0;
  let totalReviews = 0;
  let filmWatchedThisMonth = 0;
  let seriesWatchedThisMonth = 0;

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  const startMs = startOfMonth.getTime();
  const endMs = endOfMonth.getTime();

  for (const f of films) {
    const { data: film } = await supabase
      .from("films")
      .select("duration_min, review, watched_at")
      .eq("content_id", f.id)
      .single();
    if (film?.duration_min) totalFilmWatchTimeMinutes += film.duration_min;
    if (film?.review) totalReviews++;
    if (film?.watched_at) {
      const t = new Date(film.watched_at).getTime();
      if (t >= startMs && t <= endMs) filmWatchedThisMonth++;
    }
  }

  for (const s of series) {
    const { data: ser } = await supabase
      .from("series")
      .select("total_duration_min, avg_episode_min, episodes_watched, review, watched_at")
      .eq("content_id", s.id)
      .single();
    if (ser) {
      const mins = (ser as { total_duration_min?: number | null }).total_duration_min;
      totalSeriesWatchTimeMinutes +=
        mins != null && !Number.isNaN(mins)
          ? mins
          : (ser.avg_episode_min ?? 0) * (ser.episodes_watched ?? 0);
      if (ser.review) totalReviews++;
      if (ser.watched_at) {
        const t = new Date(ser.watched_at).getTime();
        if (t >= startMs && t <= endMs) seriesWatchedThisMonth++;
      }
    }
  }

  return {
    totalFilms: films.length,
    totalSeries: series.length,
    totalFilmWatchTimeMinutes,
    totalSeriesWatchTimeMinutes,
    totalWatchTimeMinutes: totalFilmWatchTimeMinutes + totalSeriesWatchTimeMinutes,
    totalReviews,
    filmWatchedThisMonth,
    seriesWatchedThisMonth,
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
    spine_url: data.spine_url ?? null,
    review: data.review || null,
    director: data.director ?? null,
    genre_tags: data.genre_tags ?? [],
    rating_5: data.rating_5 ?? null,
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

  const total_duration_min =
    data.episodes_watched > 0 && data.avg_episode_min != null && data.avg_episode_min > 0
      ? data.episodes_watched * data.avg_episode_min
      : null;

  const { error: seriesError } = await supabase.from("series").insert({
    content_id: content.id,
    avg_episode_min: data.avg_episode_min ?? null,
    episodes_watched: data.episodes_watched,
    total_duration_min,
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
  const { data: book, error: bookError } = await supabase
    .from("books")
    .insert({
      title: data.title,
      author: data.author ?? "",
      page_count: data.pages ?? 1,
      status: "reading",
      rating: null,
      tags: [],
      review: data.review || null,
      cover_url: data.cover_url ?? null,
      spine_url: data.spine_url ?? "",
      start_date: null,
      end_date: null,
      progress_percent: null,
      visibility: data.visibility,
    })
    .select("id")
    .single();

  if (bookError) return { error: bookError.message };

  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath("/okuma-gunlugum");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
  return { success: true, id: book.id };
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

// --- Manual Now Playing (Spotify fallback) ---

export interface ManualNowPlayingItem {
  id: string;
  title: string;
  artist: string;
  album_art_url: string | null;
  track_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export async function getActiveManualTrack(): Promise<ManualNowPlayingItem | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("manual_now_playing")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as ManualNowPlayingItem;
}

export async function getManualNowPlayingList(): Promise<ManualNowPlayingItem[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("manual_now_playing")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as ManualNowPlayingItem[];
}

export async function createManualTrack(input: {
  title: string;
  artist: string;
  album_art_url?: string | null;
  track_url?: string | null;
  is_active?: boolean;
}) {
  const supabase = await createServerClient();
  if (input.is_active) {
    await supabase.from("manual_now_playing").update({ is_active: false }).eq("is_active", true);
  }
  const { data, error } = await supabase
    .from("manual_now_playing")
    .insert({
      title: input.title.trim(),
      artist: input.artist.trim(),
      album_art_url: input.album_art_url?.trim() || null,
      track_url: input.track_url?.trim() || null,
      is_active: input.is_active ?? false,
      sort_order: 0,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/home");
  return { success: true, id: data.id };
}

export async function updateManualTrack(
  id: string,
  input: {
    title?: string;
    artist?: string;
    album_art_url?: string | null;
    track_url?: string | null;
    is_active?: boolean;
  }
) {
  const supabase = await createServerClient();
  const updates: Record<string, unknown> = {};
  if (input.title != null) updates.title = input.title.trim();
  if (input.artist != null) updates.artist = input.artist.trim();
  if (input.album_art_url !== undefined) updates.album_art_url = input.album_art_url?.trim() || null;
  if (input.track_url !== undefined) updates.track_url = input.track_url?.trim() || null;
  if (input.is_active === true) {
    await supabase.from("manual_now_playing").update({ is_active: false }).eq("is_active", true);
    updates.is_active = true;
  } else if (input.is_active === false) {
    updates.is_active = false;
  }
  const { error } = await supabase.from("manual_now_playing").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/home");
  return { success: true };
}

export async function deleteManualTrack(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("manual_now_playing").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/home");
  return { success: true };
}

// --- Reading log: current book + goal from books + settings ---

/** Legacy shape for API / components that expect reading_status row */
export interface ReadingStatus {
  id: string;
  book_title: string;
  author: string | null;
  cover_url: string | null;
  note: string | null;
  status: "reading" | "last";
  progress_percent: number | null;
  updated_at: string;
}

/** "Şu an okuyorum": featured current book if any (status=reading + is_featured_current=true), else most recently updated reading */
export async function getCurrentReading(): Promise<Book | null> {
  const supabase = await createServerClient();
  const { data: featured } = await supabase
    .from("books")
    .select("*")
    .eq("status", "reading")
    .eq("is_featured_current", true)
    .limit(1)
    .maybeSingle();
  if (featured) return featured as Book;
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("status", "reading")
    .order("last_progress_update_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as Book;
}

/** Number of books currently reading (status='reading') */
export async function getReadingCount(): Promise<number> {
  const supabase = await createServerClient();
  const { count, error } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true })
    .eq("status", "reading");
  if (error) return 0;
  return count ?? 0;
}

/** Yıllık hedef: settings key reading_goal_{year}, value_json { year, goal }; read_count from books (finished, end_date in year) */
export interface ReadingGoal {
  year: number;
  goal: number;
  read_count: number;
}

export async function getReadingGoal(year?: number): Promise<ReadingGoal | null> {
  const supabase = await createServerClient();
  const y = year ?? new Date().getFullYear();
  const key = `reading_goal_${y}`;
  const { data: row, error } = await supabase
    .from("settings")
    .select("value_json")
    .eq("key", key)
    .maybeSingle();
  if (error || !row) return null;
  const value = row.value_json as { year?: number; goal?: number } | null;
  const goal = value?.goal ?? 12;

  const startOfYear = `${y}-01-01`;
  const endOfYear = `${y}-12-31`;
  const { count, error: countErr } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true })
    .eq("status", "finished")
    .gte("end_date", startOfYear)
    .lte("end_date", endOfYear);
  const read_count = countErr ? 0 : count ?? 0;

  return { year: y, goal, read_count };
}

/** Legacy: same shape as old reading_status for API compatibility (from books) */
export async function getReadingStatus(): Promise<ReadingStatus | null> {
  const book = await getCurrentReading();
  if (!book) return null;
  return {
    id: book.id,
    book_title: book.title,
    author: book.author || null,
    cover_url: book.cover_url,
    note: null,
    status: "reading",
    progress_percent: book.progress_percent,
    updated_at: book.last_progress_update_at,
  };
}

/** Translations page intro text (settings key: translation_intro, value_json: { text: string }) */
export async function getTranslationIntro(): Promise<string | null> {
  const supabase = await createServerClient();
  const { data: row, error } = await supabase
    .from("settings")
    .select("value_json")
    .eq("key", "translation_intro")
    .maybeSingle();
  if (error || !row) return null;
  const value = row.value_json as { text?: string } | null;
  const text = value?.text?.trim();
  return text || null;
}

/** Plaktaki Kitap sayfası: kanal tanıtım (settings key: youtube_intro) */
export interface YoutubeIntroRow {
  text: string | null;
  channel_url: string | null;
  channel_id: string | null;
  spotify_url: string | null;
}

export async function getYoutubeIntro(): Promise<YoutubeIntroRow> {
  const supabase = await createServerClient();
  const { data: row, error } = await supabase
    .from("settings")
    .select("value_json")
    .eq("key", "youtube_intro")
    .maybeSingle();
  if (error || !row) {
    return { text: null, channel_url: null, channel_id: null, spotify_url: null };
  }
  const value = row.value_json as {
    text?: string;
    channel_url?: string;
    channel_id?: string;
    spotify_url?: string;
  } | null;
  return {
    text: value?.text?.trim() || null,
    channel_url: value?.channel_url?.trim() || null,
    channel_id: value?.channel_id?.trim() || null,
    spotify_url: value?.spotify_url?.trim() || null,
  };
}

export interface AcademiaProject {
  title: string;
  url: string;
}

export interface TranslationAcademia {
  profile_url: string;
  projects: AcademiaProject[];
}

/** Academia.edu bölümü (settings key: translation_academia) */
export async function getTranslationAcademia(): Promise<TranslationAcademia | null> {
  const supabase = await createServerClient();
  const { data: row, error } = await supabase
    .from("settings")
    .select("value_json")
    .eq("key", "translation_academia")
    .maybeSingle();
  if (error || !row) return null;
  const v = row.value_json as { profile_url?: string; projects?: AcademiaProject[] } | null;
  if (!v) return null;
  const profile_url = typeof v.profile_url === "string" ? v.profile_url.trim() : "";
  const projects = Array.isArray(v.projects)
    ? v.projects.filter((p) => p && typeof p.title === "string" && typeof p.url === "string")
    : [];
  return profile_url || projects.length > 0 ? { profile_url, projects } : null;
}

export interface VolunteerProject {
  title: string;
  description: string;
  url: string;
}

export interface TranslationVolunteer {
  projects: VolunteerProject[];
}

/** Gönüllü projeler (settings key: translation_volunteer) */
export async function getTranslationVolunteer(): Promise<TranslationVolunteer | null> {
  const supabase = await createServerClient();
  const { data: row, error } = await supabase
    .from("settings")
    .select("value_json")
    .eq("key", "translation_volunteer")
    .maybeSingle();
  if (error || !row) return null;
  const v = row.value_json as { projects?: VolunteerProject[] } | null;
  if (!v || !Array.isArray(v.projects)) return null;
  const projects = v.projects.filter(
    (p) => p && typeof p.title === "string" && typeof p.url === "string"
  );
  return projects.length > 0 ? { projects } : null;
}

// --- published_books (Çeviriler sayfası) ---
export async function getPublishedBooks(): Promise<
  import("@/types/database").PublishedBook[]
> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("published_books")
    .select("*")
    .order("order_index", { ascending: true })
    .order("year", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as import("@/types/database").PublishedBook[];
}

// --- Portfolio translations (translations_settings, translation_books, translation_independent, translation_volunteer_projects) ---

export async function getTranslationsSettings(): Promise<import("@/types/database").TranslationsSettingsRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("translations_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data as import("@/types/database").TranslationsSettingsRow | null;
}

export async function getTranslationBooksPublic(): Promise<import("@/types/database").TranslationBookRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("translation_books")
    .select("*")
    .order("is_released", { ascending: false })
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as import("@/types/database").TranslationBookRow[];
}

export async function getTranslationIndependentPublic(): Promise<import("@/types/database").TranslationIndependentRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("translation_independent")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as import("@/types/database").TranslationIndependentRow[];
}

export async function getTranslationVolunteerPublic(): Promise<import("@/types/database").TranslationVolunteerProjectRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("translation_volunteer_projects")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as import("@/types/database").TranslationVolunteerProjectRow[];
}

// --- site_links (Footer) ---
export interface SiteLink {
  id: string;
  type: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

export async function getSiteLinks(): Promise<SiteLink[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("site_links")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as SiteLink[];
}
