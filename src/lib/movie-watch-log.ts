import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type MovieViewing = {
  id: string;
  contentId: string;
  title: string;
  year: number | null;
  director: string | null;
  posterUrl: string | null;
  durationMin: number;
  rating5: number | null;
  watchedAt: string | null;
  visibility: string;
};

type FilmLogRow = {
  id: string;
  content_id: string;
  duration_min: number;
  year: number | null;
  poster_url: string | null;
  director: string | null;
  rating_5: number | null;
  watched_at: string | null;
  content_items:
    | { title: string; visibility: string }
    | { title: string; visibility: string }[]
    | null;
};

export async function getMovieWatchLog(): Promise<MovieViewing[]> {
  const supabase = createAdminClient();
  const PAGE = 1000;
  const all: MovieViewing[] = [];

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("films")
      .select(
        "id, content_id, duration_min, year, poster_url, director, rating_5, watched_at, content_items!inner(title, visibility)"
      )
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);

    if (error) throw new Error(error.message);
    const batch = (data ?? []) as FilmLogRow[];
    for (const row of batch) {
      const content = Array.isArray(row.content_items)
        ? row.content_items[0]
        : row.content_items;
      if (!content?.title) continue;
      all.push({
        id: row.id,
        contentId: row.content_id,
        title: content.title,
        year: row.year,
        director: row.director,
        posterUrl: row.poster_url,
        durationMin: row.duration_min,
        rating5: row.rating_5 != null ? Number(row.rating_5) : null,
        watchedAt: row.watched_at,
        visibility: content.visibility,
      });
    }
    if (batch.length < PAGE) break;
  }

  return all;
}
