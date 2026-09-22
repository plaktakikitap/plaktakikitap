"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookCoverImage } from "@/components/reading/BookCoverImage";
import { usableBookCoverUrl } from "@/lib/book-cover";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { BookDetailModal } from "@/components/reading/BookDetailModal";
import { FilmDetailModal } from "@/components/watch-log/FilmDetailModal";
import { SeriesDetailModal } from "@/components/watch-log/SeriesDetailModal";
import type { Book } from "@/types/database";
import type { FilmItem, SeriesItem } from "@/lib/watch-log-poster";

export type SonYorumTip = "kitap" | "film" | "dizi" | "izleme";

export type SonYorumItem = {
  id: string;
  baslik: string;
  kapak_url: string | null;
  puan: number | null;
  yorum: string;
  yazar?: string | null;
  yil?: number | null;
  tip: "kitap" | "film" | "dizi";
  book?: Book;
  filmItem?: FilmItem;
  seriesItem?: SeriesItem;
};

function truncateYorum(text: string, max = 100): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}...`;
}

function subscribeMq(cb: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getDesktopSnap() {
  return typeof window !== "undefined"
    ? window.matchMedia("(min-width: 768px)").matches
    : true;
}

function useVisibleCount(): number {
  const isDesktop = useSyncExternalStore(
    subscribeMq,
    getDesktopSnap,
    () => true
  );
  return isDesktop ? 3 : 1;
}

function SonYorumKart({
  item,
  onOpen,
}: {
  item: SonYorumItem;
  onOpen: () => void;
}) {
  const cover = usableBookCoverUrl(item.kapak_url);
  const showCover = Boolean(cover);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full gap-3 rounded-lg border border-rule bg-card p-4 text-left transition duration-200 hover:scale-[1.01] hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
    >
      <div className="relative h-20 w-[60px] shrink-0 overflow-hidden rounded-[4px] bg-[#1a1714]">
        {showCover ? (
          <BookCoverImage
            src={cover}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-gold/70">
            {item.tip === "kitap" ? "kitap" : item.tip === "film" ? "film" : "dizi"}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink/90">{item.baslik}</p>
        {item.yazar ? (
          <p className="mt-0.5 truncate text-xs text-ink/50">{item.yazar}</p>
        ) : item.yil != null ? (
          <p className="mt-0.5 text-xs text-ink/50">{item.yil}</p>
        ) : null}
        {item.puan != null ? (
          <div className="mt-1.5">
            <StarRatingDisplay value={item.puan} size="sm" className="text-amber-400/90" />
          </div>
        ) : null}
        {item.yorum ? (
          <p className="mt-2 text-[0.7rem] italic leading-relaxed text-ink/55">
            {truncateYorum(item.yorum)}
          </p>
        ) : null}
      </div>
    </button>
  );
}

export function SonYorumlarim({
  items,
  tip,
}: {
  items: SonYorumItem[];
  tip: SonYorumTip;
}) {
  const reducedMotion = useReducedMotion();
  const visibleCount = useVisibleCount();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<FilmItem | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);

  const n = items.length;
  const showArrows = n > visibleCount;

  useEffect(() => {
    setCurrentIndex((i) => (n === 0 ? 0 : i % n));
  }, [n, visibleCount]);

  const visibleItems = useMemo(() => {
    if (n === 0) return [];
    const count = Math.min(visibleCount, n);
    const out: SonYorumItem[] = [];
    for (let i = 0; i < count; i++) {
      out.push(items[(currentIndex + i) % n]!);
    }
    return out;
  }, [items, currentIndex, n, visibleCount]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (n === 0) return;
      setDirection(dir);
      setCurrentIndex((i) => (i + dir + n) % n);
    },
    [n]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (!showArrows) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    },
    [go, showArrows]
  );

  const openItem = (item: SonYorumItem) => {
    if (item.book) setSelectedBook(item.book);
    else if (item.filmItem) setSelectedFilm(item.filmItem);
    else if (item.seriesItem) setSelectedSeries(item.seriesItem);
  };

  if (n === 0) return null;

  const titleHint =
    tip === "kitap"
      ? "kitap"
      : tip === "film"
        ? "film"
        : tip === "dizi"
          ? "dizi"
          : "izleme";

  const slide = reducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0, x: direction >= 0 ? 28 : -28 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: direction >= 0 ? -28 : 28 },
      };

  return (
    <>
      <section
        className="mb-12 rounded-[10px] border border-rule bg-card p-6"
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`Son yorumlarım — ${titleHint}`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-eyebrow">
            son yorumlarım
          </h2>
          {showArrows ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Önceki"
                onClick={() => go(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-rule bg-gold-soft text-gold transition hover:bg-gold/25"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Sonraki"
                onClick={() => go(1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-rule bg-gold-soft text-gold transition hover:bg-gold/25"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={`${currentIndex}-${visibleCount}`}
              custom={direction}
              initial={slide.initial}
              animate={slide.animate}
              exit={slide.exit}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.3, ease: "easeInOut" }
              }
              className="grid gap-4 md:grid-cols-3"
            >
              {visibleItems.map((item) => (
                <SonYorumKart
                  key={`${item.tip}-${item.id}-${item.baslik}`}
                  item={item}
                  onOpen={() => openItem(item)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      <FilmDetailModal item={selectedFilm} onClose={() => setSelectedFilm(null)} />
      <SeriesDetailModal
        item={selectedSeries}
        onClose={() => setSelectedSeries(null)}
      />
    </>
  );
}
