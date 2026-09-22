import type { ContentItem, Film, Series } from "@/types/database";

export type FilmItem = ContentItem & { film: Film | Film[] | null };
export type SeriesItem = ContentItem & { series: Series | Series[] | null };

export type WatchKind = "film" | "series";

export type WatchPosterItem = {
  key: string;
  kind: WatchKind;
  title: string;
  year: number | null;
  genres: string[];
  /** 0–5 */
  rating: number | null;
  /** Plain text preview from review HTML */
  reviewPreview: string;
  posterUrl: string | null;
  watchedAt: string | null;
  filmItem?: FilmItem;
  seriesItem?: SeriesItem;
  imdbUrl?: string | null;
  originalTitle?: string | null;
  runtimeMins?: number | null;
  episodeCount?: number | null;
  imdbRating?: number | null;
};

function getFilm(d: FilmItem): Film | null {
  const f = d.film;
  if (!f) return null;
  return Array.isArray(f) ? f[0] ?? null : f;
}

function getSeries(d: SeriesItem): Series | null {
  const s = d.series;
  if (!s) return null;
  return Array.isArray(s) ? s[0] ?? null : s;
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function filmToPosterItem(item: FilmItem): WatchPosterItem {
  const film = getFilm(item);
  const rating =
    film?.rating_5 != null
      ? film.rating_5
      : item.rating != null
        ? item.rating / 2
        : null;
  return {
    key: `film-${film?.id ?? item.id}`,
    kind: "film",
    title: item.title,
    year: film?.year ?? null,
    genres: film?.genre_tags ?? [],
    rating,
    reviewPreview: stripHtml(film?.review),
    posterUrl: film?.poster_url ?? null,
    watchedAt: film?.watched_at ?? item.created_at,
    filmItem: item,
  };
}

export function seriesToPosterItem(item: SeriesItem): WatchPosterItem {
  const series = getSeries(item);
  const rating =
    series?.rating_5 != null
      ? series.rating_5
      : item.rating != null
        ? item.rating / 2
        : null;
  return {
    key: `series-${item.id}`,
    kind: "series",
    title: item.title,
    year: series?.year ?? null,
    genres: series?.genre_tags ?? [],
    rating,
    reviewPreview: stripHtml(series?.review),
    posterUrl: series?.poster_url ?? null,
    watchedAt: series?.watched_at ?? item.created_at,
    seriesItem: item,
  };
}

export function initialsFromTitle(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export type ImdbWatchlistRow = {
  id: string;
  title: string;
  original_title: string | null;
  imdb_url: string | null;
  imdb_rating: number | null;
  runtime_mins: number | null;
  year: number | null;
  genres: string[] | null;
  release_date: string | null;
  user_rating: number | null;
  date_rated: string | null;
  poster_url?: string | null;
  episode_count?: number | null;
  created_at?: string | null;
};

export function estimatedSeriesMinutes(row: ImdbWatchlistRow): number {
  const runtime = row.runtime_mins != null && row.runtime_mins > 0 ? row.runtime_mins : 0;
  const episodes =
    row.episode_count != null && row.episode_count > 0 ? row.episode_count : 0;
  if (runtime && episodes) return runtime * episodes;
  return runtime;
}

export function imdbWatchlistToPosterItem(row: ImdbWatchlistRow): WatchPosterItem {
  const rating10 = row.user_rating;
  const rating =
    rating10 != null && Number.isFinite(Number(rating10))
      ? Math.round((Number(rating10) / 2) * 10) / 10
      : null;
  const watchedAt =
    row.date_rated ||
    (row.release_date && /^\d{4}-\d{2}-\d{2}/.test(row.release_date)
      ? row.release_date
      : null) ||
    (row.year != null ? `${row.year}-01-01` : null) ||
    row.created_at ||
    null;

  return {
    key: `imdb-${row.id}`,
    kind: "series",
    title: row.title,
    year: row.year,
    genres: row.genres ?? [],
    rating,
    reviewPreview: "",
    posterUrl: row.poster_url ?? null,
    watchedAt,
    imdbUrl: row.imdb_url,
    originalTitle: row.original_title,
    runtimeMins: row.runtime_mins,
    episodeCount: row.episode_count,
    imdbRating: row.imdb_rating != null ? Number(row.imdb_rating) : null,
  };
}
