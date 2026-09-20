import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripHtml } from "@/lib/watch-log-poster";

function formatDate(v: string | null | undefined): string {
  if (!v) return "";
  try {
    return new Date(v).toISOString().slice(0, 10);
  } catch {
    return String(v);
  }
}

export async function fetchExportKitaplar(): Promise<Record<string, unknown>[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((b) => ({
    title: b.title ?? "",
    author: b.author ?? "",
    page_count: b.page_count ?? "",
    status: b.status ?? "",
    rating: b.rating ?? "",
    tags: Array.isArray(b.tags) ? b.tags.join(", ") : "",
    review: stripHtml(b.review),
    quote: b.quote ?? "",
    start_date: formatDate(b.start_date),
    end_date: formatDate(b.end_date),
    visibility: b.visibility ?? "",
    created_at: formatDate(b.created_at),
  }));
}

export async function fetchExportFilmler(): Promise<Record<string, unknown>[]> {
  const supabase = createAdminClient();
  const { data: items, error } = await supabase
    .from("content_items")
    .select("id, title, visibility, created_at, films(*)")
    .eq("type", "film")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (items ?? []).map((item) => {
    const raw = item.films as unknown;
    const film = Array.isArray(raw) ? raw[0] : raw;
    const f = (film ?? {}) as Record<string, unknown>;
    const genres = f.genre_tags;
    return {
      title: item.title ?? "",
      year: f.year ?? "",
      director: f.director ?? "",
      genre: Array.isArray(genres) ? genres.join(", ") : "",
      rating: f.rating_5 ?? "",
      duration_min: f.duration_min ?? "",
      review: stripHtml(f.review as string | null),
      watched_at: formatDate(f.watched_at as string | null),
      rewatch_count: f.rewatch_count ?? 0,
      visibility: item.visibility ?? "",
      created_at: formatDate(item.created_at),
    };
  });
}

export async function fetchExportDiziler(): Promise<Record<string, unknown>[]> {
  const supabase = createAdminClient();
  const { data: items, error } = await supabase
    .from("content_items")
    .select("id, title, visibility, created_at, series(*)")
    .eq("type", "series")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (items ?? []).map((item) => {
    const raw = item.series as unknown;
    const series = Array.isArray(raw) ? raw[0] : raw;
    const s = (series ?? {}) as Record<string, unknown>;
    const genres = s.genre_tags;
    return {
      title: item.title ?? "",
      year: s.year ?? "",
      creator_or_director: s.creator_or_director ?? "",
      seasons: s.total_seasons ?? "",
      seasons_watched: s.seasons_watched ?? "",
      episodes_watched: s.episodes_watched ?? "",
      genre: Array.isArray(genres) ? genres.join(", ") : "",
      rating: s.rating_5 ?? "",
      status: s.status ?? "",
      review: stripHtml(s.review as string | null),
      watched_at: formatDate(s.watched_at as string | null),
      visibility: item.visibility ?? "",
      created_at: formatDate(item.created_at),
    };
  });
}
