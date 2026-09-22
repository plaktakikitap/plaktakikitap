"use client";

import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Tv, X } from "lucide-react";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { ModalPortal } from "@/components/ui/ModalPortal";
import {
  initialsFromTitle,
  type WatchPosterItem,
} from "@/lib/watch-log-poster";
import { translateGenre } from "@/lib/series-progress";

export function ImdbPosterModal({
  item,
  onClose,
}: {
  item: WatchPosterItem | null;
  onClose: () => void;
}) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!item) return null;

  const showOriginal =
    Boolean(item.originalTitle) && item.originalTitle !== item.title;
  const totalMins =
    item.runtimeMins && item.episodeCount
      ? item.runtimeMins * item.episodeCount
      : item.runtimeMins;

  return (
    <ModalPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="imdb-modal-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden
        />

        <motion.div
          initial={{ scale: 0.98, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.98, opacity: 0, y: 12 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="watch-detail-modal relative flex w-full max-w-2xl overflow-hidden rounded-2xl border shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="relative w-[42%] min-w-[140px] shrink-0 sm:min-w-[180px]">
            <div className="aspect-[2/3] w-full overflow-hidden border-r border-cream/10 bg-black/30">
              {item.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.posterUrl}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-cream/30">
                  <Tv className="h-16 w-16" aria-hidden />
                  <span
                    className="text-2xl tracking-wide"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {initialsFromTitle(item.title)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1.5 text-cream/70 transition hover:bg-cream/10 hover:text-cream"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>

            <h2
              id="imdb-modal-title"
              className="pr-8 font-editorial text-xl font-semibold leading-tight sm:text-2xl"
              style={{ color: "#F5F0E8" }}
            >
              {item.title}
            </h2>
            {showOriginal ? (
              <p className="mt-1 text-sm text-cream/60">{item.originalTitle}</p>
            ) : null}

            {item.genres.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-cream/15 px-2 py-0.5 text-[11px] text-cream/75"
                  >
                    {translateGenre(g)}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-3 space-y-1.5 text-sm text-cream/85">
              {item.year != null ? (
                <p>
                  <span className="watch-detail-muted">Yıl:</span> {item.year}
                </p>
              ) : null}
              {item.episodeCount ? (
                <p>
                  <span className="watch-detail-muted">Bölüm:</span>{" "}
                  {item.episodeCount}
                </p>
              ) : null}
              {item.runtimeMins ? (
                <p>
                  <span className="watch-detail-muted">Ort. bölüm:</span>{" "}
                  {item.runtimeMins} dk
                </p>
              ) : null}
              {totalMins ? (
                <p>
                  <span className="watch-detail-muted">Tahmini süre:</span>{" "}
                  {totalMins} dk
                </p>
              ) : null}
            </div>

            {item.rating != null ? (
              <div className="mt-3 flex items-center gap-2">
                <span className="watch-detail-muted text-sm">Puan:</span>
                <StarRatingDisplay
                  value={item.rating}
                  size="lg"
                  className="text-amber-400"
                />
                <span className="text-sm text-cream/60">
                  {item.imdbRating != null
                    ? `IMDb ${item.imdbRating}`
                    : `(${item.rating} / 5)`}
                </span>
              </div>
            ) : null}

            {item.kind !== "series" && item.imdbUrl ? (
              <a
                href={item.imdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-fit text-sm text-gold underline-offset-4 hover:underline"
              >
                IMDb’de aç
              </a>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </ModalPortal>
  );
}
