"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import {
  initialsFromTitle,
  type WatchKind,
  type WatchPosterItem,
} from "@/lib/watch-log-poster";
import type { FilmItem, SeriesItem } from "@/lib/watch-log-poster";
import { FilmDetailModal } from "./FilmDetailModal";
import { SeriesDetailModal } from "./SeriesDetailModal";
import { ImdbPosterModal } from "./ImdbPosterModal";

type KindFilter = "all" | WatchKind;
type RatingFilter = "all" | "3" | "5";
type SortKey =
  | "title-asc"
  | "title-desc"
  | "rating-asc"
  | "rating-desc"
  | "watched-desc"
  | "watched-asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "watched-desc", label: "En son izlenen" },
  { value: "watched-asc", label: "İlk izlenen" },
  { value: "title-asc", label: "A–Z" },
  { value: "title-desc", label: "Z–A" },
  { value: "rating-desc", label: "En yüksek puan" },
  { value: "rating-asc", label: "En düşük puan" },
];

function compareWatchItems(a: WatchPosterItem, b: WatchPosterItem, sort: SortKey): number {
  const titleA = a.title.localeCompare(b.title, "tr", { sensitivity: "base" });
  const titleB = -titleA;
  const ratingA = a.rating ?? -1;
  const ratingB = b.rating ?? -1;
  const timeA = a.watchedAt ? new Date(a.watchedAt).getTime() : 0;
  const timeB = b.watchedAt ? new Date(b.watchedAt).getTime() : 0;

  switch (sort) {
    case "title-asc":
      return titleA;
    case "title-desc":
      return titleB;
    case "rating-asc":
      return ratingA - ratingB || titleA;
    case "rating-desc":
      return ratingB - ratingA || titleA;
    case "watched-asc":
      return timeA - timeB || titleA;
    case "watched-desc":
    default:
      return timeB - timeA || titleA;
  }
}

function PosterCard({
  item,
  onOpen,
}: {
  item: WatchPosterItem;
  onOpen: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPoster = Boolean(item.posterUrl) && !imgFailed;
  const preview =
    item.reviewPreview.length > 60
      ? `${item.reviewPreview.slice(0, 60).trimEnd()}…`
      : item.reviewPreview;

  return (
    <div className="group flex flex-col">
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-[2/3] w-full overflow-hidden rounded-[5px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        {showPoster ? (
          <Image
            src={item.posterUrl!}
            alt=""
            fill
            sizes="(max-width:640px) 33vw, (max-width:1024px) 25vw, 16vw"
            className="object-cover transition-transform duration-[250ms] ease-out group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center transition-transform duration-[250ms] ease-out group-hover:scale-105"
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

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-black/0 p-2.5 opacity-0 transition-all duration-[250ms] ease-out group-hover:bg-black/75 group-hover:opacity-100">
          <div>
            <p className="text-[11px] font-semibold leading-snug text-cream">
              {item.title}
              {item.year != null ? (
                <span className="ml-1 font-normal text-cream/50">{item.year}</span>
              ) : null}
            </p>
            {item.rating != null ? (
              <div className="mt-1.5">
                <StarRatingDisplay value={item.rating} size="sm" />
              </div>
            ) : null}
          </div>
          {preview ? (
            <p className="line-clamp-3 text-[10px] italic leading-relaxed text-cream/70">
              {preview}
            </p>
          ) : null}
        </div>
      </button>

      <div className="mt-1.5 px-0.5">
        <p className="line-clamp-2 text-[0.72rem] leading-snug text-ink-muted">
          {item.title}
        </p>
        {item.rating != null ? (
          <div className="mt-0.5">
            <StarRatingDisplay value={item.rating} size="sm" className="scale-90 origin-left" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function WatchPosterGrid({
  items,
  initialKind = "all",
  showKindFilter = true,
}: {
  items: WatchPosterItem[];
  initialKind?: KindFilter;
  showKindFilter?: boolean;
}) {
  const [kind, setKind] = useState<KindFilter>(initialKind);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("watched-desc");
  const [selectedFilm, setSelectedFilm] = useState<FilmItem | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);
  const [selectedImdb, setSelectedImdb] = useState<WatchPosterItem | null>(null);

  const watchYears = useMemo(() => {
    const years = new Set<number>();
    for (const item of items) {
      if (!item.watchedAt) continue;
      const y = new Date(item.watchedAt).getFullYear();
      if (!Number.isNaN(y)) years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (kind !== "all") list = list.filter((i) => i.kind === kind);
    if (yearFilter !== "all") {
      const y = Number(yearFilter);
      list = list.filter((i) => {
        if (!i.watchedAt) return false;
        return new Date(i.watchedAt).getFullYear() === y;
      });
    }
    if (ratingFilter === "3") {
      list = list.filter((i) => (i.rating ?? 0) >= 3);
    } else if (ratingFilter === "5") {
      list = list.filter((i) => (i.rating ?? 0) >= 5);
    }
    return [...list].sort((a, b) => compareWatchItems(a, b, sortKey));
  }, [items, kind, yearFilter, ratingFilter, sortKey]);

  const pill = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs transition ${
      active
        ? "bg-gold/25 text-ink ring-1 ring-gold/40"
        : "bg-ink/5 text-ink/55 hover:bg-ink/5 hover:text-ink/80"
    }`;

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {showKindFilter ? (
          <>
            {(
              [
                ["all", "Tümü"],
                ["film", "Film"],
                ["series", "Dizi"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                className={pill(kind === value)}
              >
                {label}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-ink/[0.06]" aria-hidden />
          </>
        ) : null}

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="rounded-full border border-ink/15 bg-ink/5 px-3 py-1.5 text-xs text-ink/80 outline-none focus:border-gold/40"
          aria-label="İzleme yılı"
        >
          <option value="all">Tüm yıllar</option>
          {watchYears.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value as RatingFilter)}
          className="rounded-full border border-ink/15 bg-ink/5 px-3 py-1.5 text-xs text-ink/80 outline-none focus:border-gold/40"
          aria-label="Minimum puan"
        >
          <option value="all">Tüm puanlar</option>
          <option value="5">★★★★★ ve üzeri</option>
          <option value="3">★★★ ve üzeri</option>
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-full border border-ink/15 bg-ink/5 px-3 py-1.5 text-xs text-ink/80 outline-none focus:border-gold/40"
          aria-label="Sıralama"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="ml-auto text-[11px] text-ink/40">
          {filtered.length} kayıt
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">
          Bu filtreye uygun kayıt yok.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((item) => (
            <PosterCard
              key={item.key}
              item={item}
              onOpen={() => {
                if (item.kind === "film" && item.filmItem) {
                  setSelectedFilm(item.filmItem);
                } else if (item.kind === "series" && item.seriesItem) {
                  setSelectedSeries(item.seriesItem);
                } else {
                  setSelectedImdb(item);
                }
              }}
            />
          ))}
        </div>
      )}

      <FilmDetailModal
        item={selectedFilm}
        onClose={() => setSelectedFilm(null)}
      />
      <SeriesDetailModal
        item={selectedSeries}
        onClose={() => setSelectedSeries(null)}
      />
      <ImdbPosterModal
        item={selectedImdb}
        onClose={() => setSelectedImdb(null)}
      />
    </section>
  );
}
