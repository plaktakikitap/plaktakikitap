import type { Book } from "@/types/database";
import {
  filmToPosterItem,
  seriesToPosterItem,
  stripHtml,
  type FilmItem,
  type SeriesItem,
  type WatchPosterItem,
} from "@/lib/watch-log-poster";
import type { SonYorumItem } from "@/components/son-yorumlarim/SonYorumlarim";

function hasYorum(text: string | null | undefined): boolean {
  return Boolean(text && text.trim());
}

export function booksToSonYorumlar(
  books: Book[],
  limit = 10
): SonYorumItem[] {
  return books
    .filter((b) => hasYorum(stripHtml(b.review)))
    .slice(0, limit)
    .map((book) => ({
      id: book.id,
      baslik: book.title,
      kapak_url: book.cover_url,
      puan: book.rating,
      yorum: stripHtml(book.review),
      yazar: book.author,
      tip: "kitap" as const,
      book,
    }));
}

export function watchItemsToSonYorumlar(
  items: WatchPosterItem[],
  tip: "film" | "dizi" | "izleme",
  limit = 10
): SonYorumItem[] {
  const filtered = items
    .filter((i) => hasYorum(i.reviewPreview))
    .filter((i) => {
      if (tip === "film") return i.kind === "film";
      if (tip === "dizi") return i.kind === "series";
      return true;
    })
    .sort((a, b) => {
      const ta = a.watchedAt ? new Date(a.watchedAt).getTime() : 0;
      const tb = b.watchedAt ? new Date(b.watchedAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, limit);

  return filtered.map((item) => ({
    id: item.key,
    baslik: item.title,
    kapak_url: item.posterUrl,
    puan: item.rating,
    yorum: item.reviewPreview,
    yil: item.year,
    tip: item.kind === "film" ? ("film" as const) : ("dizi" as const),
    filmItem: item.filmItem,
    seriesItem: item.seriesItem,
  }));
}

export function filmsToSonYorumlar(
  films: FilmItem[],
  limit = 10
): SonYorumItem[] {
  return watchItemsToSonYorumlar(films.map(filmToPosterItem), "film", limit);
}

export function seriesToSonYorumlar(
  seriesList: SeriesItem[],
  limit = 10
): SonYorumItem[] {
  return watchItemsToSonYorumlar(
    seriesList.map(seriesToPosterItem),
    "dizi",
    limit
  );
}
