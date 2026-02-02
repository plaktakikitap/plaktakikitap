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

export async function getBooks(includePrivate = false): Promise<(ContentItem & { book: Book })[]> {
  const supabase = await createServerClient();
  let query = supabase
    .from("content_items")
    .select("*, book:books(*)")
    .eq("type", "book")
    .not("book", "is", null)
    .order("created_at", { ascending: false });

  if (!includePrivate) {
    query = query.in("visibility", ["public", "unlisted"]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as (ContentItem & { book: Book })[];
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
    supabase.from("content_items").select("id").eq("type", "book").in("visibility", vis),
  ]);

  const films = filmsRes.data ?? [];
  const series = seriesRes.data ?? [];
  const books = booksRes.data ?? [];

  let totalWatchTime = 0;
  let totalReviews = 0;

  for (const f of films) {
    const { data: film } = await supabase.from("films").select("duration_min, review").eq("content_id", f.id).single();
    if (film) {
      totalWatchTime += film.duration_min ?? 0;
      if (film.review) totalReviews++;
    }
  }

  for (const s of series) {
    const { data: ser } = await supabase.from("series").select("avg_episode_min, episodes_watched, review").eq("content_id", s.id).single();
    if (ser) {
      totalWatchTime += (ser.avg_episode_min ?? 0) * (ser.episodes_watched ?? 0);
      if (ser.review) totalReviews++;
    }
  }

  for (const b of books) {
    const { data: book } = await supabase.from("books").select("review").eq("content_id", b.id).single();
    if (book?.review) totalReviews++;
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
