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
