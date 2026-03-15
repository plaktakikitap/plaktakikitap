import { createServerClient } from "@/lib/supabase/server";
import type { ContentItem, Film, Series, Book, Stats } from "@/types/database";

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
  const supabase = await createServerClient();
  let query = supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (!includePrivate) {
    query = query.in("visibility", ["public", "unlisted"]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Book[];
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

  let totalWatchTime = 0;
  let totalReviews = 0;

  for (const f of films) {
    const { data: film } = await supabase.from("films").select("duration_min, rewatch_count, review").eq("content_id", f.id).single();
    if (film) {
      const mult = 1 + (film.rewatch_count ?? 0);
      totalWatchTime += (film.duration_min ?? 0) * mult;
      if (film.review) totalReviews++;
    }
  }

  for (const s of series) {
    const { data: ser } = await supabase.from("series").select("total_duration_min, rewatch_count, avg_episode_min, episodes_watched, review").eq("content_id", s.id).single();
    if (ser) {
      const mins = (ser as { total_duration_min?: number | null }).total_duration_min;
      const base = mins != null && !Number.isNaN(mins) ? mins : (ser.avg_episode_min ?? 0) * (ser.episodes_watched ?? 0);
      const mult = 1 + (ser.rewatch_count ?? 0);
      totalWatchTime += base * mult;
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
    totalWatchTimeMinutes: totalWatchTime,
    totalReviews,
  };
  } catch {
    return DEFAULT_STATS;
  }
}
