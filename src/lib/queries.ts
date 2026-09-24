import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { ContentItem, Film, Series, Book, BookStatus, Stats } from "@/types/database";
import { isBookStatus } from "@/types/database";
import { filmWatchMinutes, seriesWatchMinutes } from "@/lib/utils/time";

export async function getFilms(includePrivate = false): Promise<(ContentItem & { film: Film })[]> {
  const supabase = await createServerClient();
  let query = supabase
    .from("content_items")
    .select("*, film:films(*)")
    .eq("type", "film")
    .not("film", "is", null)
    .order("created_at", { ascending: false });

  if (!includePrivate) {
    query = query.in("visibility", ["public", "unlisted"]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as (ContentItem & { film: Film })[];
}

export async function getSeries(includePrivate = false): Promise<(ContentItem & { series: Series })[]> {
  const supabase = await createServerClient();
  let query = supabase
    .from("content_items")
    .select("*, series:series(*)")
    .eq("type", "series")
    .not("series", "is", null)
    .order("created_at", { ascending: false });

  if (!includePrivate) {
    query = query.in("visibility", ["public", "unlisted"]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as (ContentItem & { series: Series })[];
}

/** Tek film kaydı (düzenleme sayfası için). id = content_items.id */
export async function getFilmItem(
  id: string
): Promise<(ContentItem & { film: Film }) | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*, film:films(*)")
    .eq("type", "film")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  const row = data as (ContentItem & { film: Film | Film[] }) | null;
  if (!row) return null;
  const film = Array.isArray(row.film) ? row.film[0] : row.film;
  if (!film) return null;
  return { ...row, film } as ContentItem & { film: Film };
}

/** Tek dizi kaydı (düzenleme sayfası için). id = content_items.id */
export async function getSeriesItem(
  id: string
): Promise<(ContentItem & { series: Series }) | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*, series:series(*)")
    .eq("type", "series")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  const row = data as (ContentItem & { series: Series | Series[] }) | null;
  if (!row) return null;
  const series = Array.isArray(row.series) ? row.series[0] : row.series;
  if (!series) return null;
  return { ...row, series } as ContentItem & { series: Series };
}

export async function getBooks(includePrivate = false): Promise<Book[]> {
  const supabase = includePrivate
    ? createAdminClient()
    : await createServerClient();
  let query = supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (!includePrivate) {
    query = query.in("visibility", ["public", "unlisted"]).neq("status", "to_read");
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Book[];
}

export async function patchAdminBook(
  id: string,
  payload: Record<string, unknown>
): Promise<Book | null> {
  const supabase = createAdminClient();
  const row: Record<string, unknown> = {};

  if (payload.status !== undefined) {
    if (!isBookStatus(payload.status)) return null;
    row.status = payload.status;
  }
  if (payload.visibility !== undefined) {
    const v = String(payload.visibility);
    if (!["public", "unlisted", "private"].includes(v)) return null;
    row.visibility = v;
  }
  if (payload.is_featured_current !== undefined) {
    row.is_featured_current = Boolean(payload.is_featured_current);
  }
  if (payload.progress_percent !== undefined) {
    if (payload.progress_percent === null) {
      row.progress_percent = null;
    } else {
      const n = Number(payload.progress_percent);
      if (Number.isNaN(n)) return null;
      row.progress_percent = Math.max(0, Math.min(100, Math.round(n)));
    }
    row.last_progress_update_at = new Date().toISOString();
  }
  if (payload.review !== undefined) {
    if (payload.review === null) {
      row.review = null;
    } else {
      const text = String(payload.review).trim();
      row.review = text === "" ? null : text;
    }
  }

  if (Object.keys(row).length === 0) return null;

  const status = row.status as BookStatus | undefined;
  if (status === "to_read") {
    row.is_featured_current = false;
    if (payload.visibility === undefined) row.visibility = "private";
  }
  if (status === "reading") {
    row.last_progress_update_at = new Date().toISOString();
    if (payload.visibility === undefined) row.visibility = "public";
    if (payload.is_featured_current === undefined) {
      await supabase.from("books").update({ is_featured_current: false });
      row.is_featured_current = true;
    }
    const { data: current } = await supabase
      .from("books")
      .select("start_date")
      .eq("id", id)
      .maybeSingle();
    if (!current?.start_date) {
      row.start_date = new Date().toISOString().slice(0, 10);
    }
  }
  if (status === "finished") {
    row.is_featured_current = false;
    if (payload.visibility === undefined) row.visibility = "public";
    const { data: current } = await supabase
      .from("books")
      .select("end_date")
      .eq("id", id)
      .maybeSingle();
    if (!current?.end_date) {
      row.end_date = new Date().toISOString().slice(0, 10);
    }
  }

  const { data, error } = await supabase
    .from("books")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;

  revalidatePath("/");
  revalidatePath("/readings");
  revalidatePath("/books");
  revalidatePath("/secretgate/reading-log");
  revalidatePath("/secretgate/okunacaklar");
  revalidatePath("/secretgate/su-an");
  return data as Book;
}

const DEFAULT_STATS: Stats = {
  totalFilms: 0,
  totalSeries: 0,
  totalBooks: 0,
  totalWatchTimeMinutes: 0,
  totalReviews: 0,
};

export interface HomeStats extends Stats {
  totalPosts: number;
  totalTranslations: number;
  totalPlannerEntries: number;
}

const DEFAULT_HOME_STATS: HomeStats = {
  ...DEFAULT_STATS,
  totalPosts: 0,
  totalTranslations: 0,
  totalPlannerEntries: 0,
};

export async function getHomeStats(): Promise<HomeStats> {
  try {
    const supabase = await createServerClient();
    const [stats, postsRes, translationsRes, plannerRes] = await Promise.all([
      getStats(false),
      supabase.from("content_items").select("id").eq("type", "post").in("visibility", ["public", "unlisted"]),
      supabase.from("content_items").select("id").eq("type", "translation").in("visibility", ["public", "unlisted"]),
      supabase.from("planner_entries").select("id").in("visibility", ["public", "unlisted"]),
    ]);
    return {
      ...stats,
      totalPosts: postsRes.data?.length ?? 0,
      totalTranslations: translationsRes.data?.length ?? 0,
      totalPlannerEntries: plannerRes.data?.length ?? 0,
    };
  } catch {
    return DEFAULT_HOME_STATS;
  }
}

export async function getStats(includePrivate = false): Promise<Stats> {
  try {
    const supabase = await createServerClient();
  const vis = includePrivate ? ["public", "unlisted", "private"] : ["public", "unlisted"];

  const [filmsRes, seriesRes, booksRes] = await Promise.all([
    supabase.from("content_items").select("id").eq("type", "film").in("visibility", vis),
    supabase.from("content_items").select("id").eq("type", "series").in("visibility", vis),
    supabase.from("books").select("id, review").in("visibility", vis),
  ]);

  const films = filmsRes.data ?? [];
  const series = seriesRes.data ?? [];
  const books = booksRes.data ?? [];

  let filmWatchTime = 0;
  let seriesWatchTime = 0;
  let totalReviews = 0;

  for (const f of films) {
    const { data: film } = await supabase.from("films").select("duration_min, rewatch_count, review").eq("content_id", f.id).single();
    if (film) {
      filmWatchTime += filmWatchMinutes(film);
      if (film.review) totalReviews++;
    }
  }

  for (const s of series) {
    const { data: ser } = await supabase.from("series").select("total_duration_min, rewatch_count, avg_episode_min, episodes_watched, review").eq("content_id", s.id).single();
    if (ser) {
      seriesWatchTime += seriesWatchMinutes(ser);
      if (ser.review) totalReviews++;
    }
  }

  for (const b of books) {
    if ((b as { review?: string | null }).review) totalReviews++;
  }

  return {
    totalFilms: films.length,
    totalSeries: series.length,
    totalBooks: books.length,
    totalWatchTimeMinutes: filmWatchTime + seriesWatchTime,
    totalReviews,
  };
  } catch {
    return DEFAULT_STATS;
  }
}
