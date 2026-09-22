"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { initialsFromTitle } from "@/lib/watch-log-poster";
import {
  seriesBarIsFull,
  seriesBarRatio,
  seriesOriginLabel,
  seriesProgressColor,
  type SeriesGridItem,
  type SeriesOriginLabel,
} from "@/lib/series-progress";

const GENRES = [
  { id: "Tümü", label: "Tümü" },
  { id: "Drama", label: "Dram" },
  { id: "Comedy", label: "Komedi" },
  { id: "Crime", label: "Suç" },
  { id: "Animation", label: "Animasyon" },
  { id: "Sci-Fi", label: "Bilimkurgu" },
  { id: "Horror", label: "Korku" },
  { id: "Thriller", label: "Gerilim" },
  { id: "Action", label: "Aksiyon" },
] as const;

const ORIGINS: Array<"Tümü" | SeriesOriginLabel> = [
  "Tümü",
  "Türk",
  "Amerikan",
  "Kore",
  "Japon",
  "İngiliz",
  "Diğer",
];

const STATUS_FILTERS = [
  "Tümü",
  "İzliyorum",
  "Bitti",
  "Bıraktım",
  "İzlenecek",
] as const;

const SORT_OPTIONS = [
  { id: "position", label: "Liste" },
  { id: "rating", label: "Puan" },
  { id: "year", label: "Yıl" },
  { id: "alpha", label: "A-Z" },
] as const;

type GenreFilter = (typeof GENRES)[number]["id"];
type OriginFilter = (typeof ORIGINS)[number];
type StatusFilter = (typeof STATUS_FILTERS)[number];
type SortId = (typeof SORT_OPTIONS)[number]["id"];

function matchesGenre(item: SeriesGridItem, genre: GenreFilter): boolean {
  if (genre === "Tümü") return true;
  return item.genres.some((g) => {
    const n = g.trim().toLowerCase();
    if (genre === "Sci-Fi") {
      return n === "sci-fi" || n === "sci fi" || n.includes("science fiction");
    }
    return n === genre.toLowerCase();
  });
}

function matchesStatus(item: SeriesGridItem, status: StatusFilter): boolean {
  if (status === "Tümü") return true;
  if (status === "İzliyorum") {
    return item.watchStatus === "watching" || item.watchStatus === "rewatching";
  }
  if (status === "Bitti") {
    return item.watchStatus === "completed" || item.tone === "completed";
  }
  if (status === "Bıraktım") {
    return item.watchStatus === "dropped" || item.status === "dropped";
  }
  return item.watchStatus === "watchlist" || !item.watchStatus;
}

function ProgressBar({ item }: { item: SeriesGridItem }) {
  const color = seriesProgressColor(item);
  const ratio = seriesBarRatio(item);
  const full = seriesBarIsFull(item);
  const width = full ? 100 : Math.round(ratio * 100);

  return (
    <div
      className="relative mt-2 h-1 overflow-hidden rounded-full bg-ink/10"
      aria-hidden
    >
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
        style={{
          width: `${width}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

function SeriesCard({ item }: { item: SeriesGridItem }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPoster = Boolean(item.posterUrl) && !imgFailed;
  const watching =
    item.watchStatus === "watching" || item.watchStatus === "rewatching";
  const dropped =
    item.watchStatus === "dropped" || item.status === "dropped";

  return (
    <Link
      href={`/diziler/${item.contentId}`}
      className="group flex cursor-pointer flex-col"
    >
      <div className="relative mb-0 aspect-[2/3] w-full overflow-hidden rounded-lg bg-ink/5">
        {showPoster ? (
          <Image
            src={item.posterUrl!}
            alt={item.title}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 16vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-2 text-center"
            style={{
              background: "linear-gradient(160deg, #1a1714 0%, #0a0908 100%)",
            }}
          >
            <span
              className="text-2xl font-medium tracking-wide text-gold sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {initialsFromTitle(item.title)}
            </span>
          </div>
        )}

        {watching ? (
          <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-green-400 ring-2 ring-black/30" />
        ) : null}
        {dropped ? (
          <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-red-400 ring-2 ring-black/30" />
        ) : null}
      </div>

      <ProgressBar item={item} />

      <div className="mt-1.5">
        <p className="line-clamp-2 text-sm font-medium leading-tight text-ink group-hover:underline">
          {item.title}
        </p>
        <p className="mt-0.5 text-xs text-ink-muted">
          {item.year ?? ""}
          {item.totalSeasons ? ` · ${item.totalSeasons} sezon` : ""}
        </p>
      </div>
    </Link>
  );
}

function pillClass(active: boolean) {
  return `rounded-full px-3 py-1 text-sm transition-colors ${
    active
      ? "bg-ink text-cream"
      : "bg-ink/5 text-ink/55 hover:bg-ink/10 hover:text-ink/80"
  }`;
}

export function SeriesGrid({ series }: { series: SeriesGridItem[] }) {
  const [genreFilter, setGenreFilter] = useState<GenreFilter>("Tümü");
  const [originFilter, setOriginFilter] = useState<OriginFilter>("Tümü");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Tümü");
  const [sort, setSort] = useState<SortId>("position");

  const filtered = useMemo(() => {
    const list = series.filter((s) => {
      if (!matchesGenre(s, genreFilter)) return false;
      if (originFilter !== "Tümü" && seriesOriginLabel(s.originCountry) !== originFilter) {
        return false;
      }
      if (!matchesStatus(s, statusFilter)) return false;
      return true;
    });

    list.sort((a, b) => {
      if (sort === "rating") {
        return (b.imdbRating || 0) - (a.imdbRating || 0);
      }
      if (sort === "year") {
        return (b.year || 0) - (a.year || 0);
      }
      if (sort === "alpha") {
        return (a.title || "").localeCompare(b.title || "", "tr");
      }
      return (a.imdbPosition || 999) - (b.imdbPosition || 999);
    });
    return list;
  }, [series, genreFilter, originFilter, statusFilter, sort]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={pillClass(statusFilter === f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {GENRES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGenreFilter(g.id)}
              className={pillClass(genreFilter === g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {ORIGINS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOriginFilter(o)}
              className={pillClass(originFilter === o)}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <span className="text-ink/45">Sırala:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSort(opt.id)}
            className={
              sort === opt.id ? "font-semibold text-ink" : "text-ink/45"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="mb-6 text-sm text-ink/50">{filtered.length} dizi</p>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">
          Bu filtreye uygun dizi yok.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((item) => (
            <SeriesCard key={item.contentId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SeriesGrid;
