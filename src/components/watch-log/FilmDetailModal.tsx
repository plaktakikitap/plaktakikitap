"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ContentItem, Film } from "@/types/database";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { Film as FilmIcon } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";

type FilmItem = ContentItem & { film: Film | Film[] | null };

function getFilm(d: FilmItem): Film | null {
  const f = d.film;
  if (!f) return null;
  return Array.isArray(f) ? f[0] ?? null : f;
}

interface FilmDetailModalProps {
  item: FilmItem | null;
  onClose: () => void;
}

export function FilmDetailModal({ item, onClose }: FilmDetailModalProps) {
  const film = item ? getFilm(item) : null;

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

  if (!item || !film) return null;

  const totalViews = 1 + (film.rewatch_count ?? 0);
  const coverUrl = film.poster_url;
  const ratingValue =
    film.rating_5 ?? (item.rating != null ? item.rating / 2 : null);
  const genreTags = film.genre_tags ?? [];

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
        aria-labelledby="film-modal-title"
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
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-cream/30">
                  <FilmIcon className="h-20 w-20" aria-hidden />
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
              id="film-modal-title"
              className="pr-8 font-editorial text-xl font-semibold leading-tight sm:text-2xl"
              style={{ color: "#F5F0E8" }}
            >
              {item.title}
            </h2>

            {film.director && (
              <p className="mt-2 text-sm text-cream/80">
                <span className="watch-detail-muted">Yönetmen:</span>{" "}
                {film.director}
              </p>
            )}

            {genreTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {genreTags.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-cream/20 bg-cream/5 px-2.5 py-1 text-xs font-medium text-cream/90"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-2 text-sm text-cream/75">
              <span className="watch-detail-muted">Süre:</span>{" "}
              {film.duration_min} dk
              {film.year != null && (
                <span className="watch-detail-muted ml-2">· {film.year}</span>
              )}
            </p>

            {ratingValue != null && (
              <div className="mt-3 flex items-center gap-2">
                <span className="watch-detail-muted text-sm">Puan:</span>
                <StarRatingDisplay
                  value={ratingValue}
                  size="lg"
                  className="text-amber-400"
                />
                <span className="text-sm text-cream/60">
                  ({ratingValue} / 5)
                </span>
              </div>
            )}

            {totalViews > 1 && (
              <div className="mt-4">
                <span className="rounded bg-cream/10 px-2 py-1 text-xs font-medium text-cream/80">
                  x{totalViews} izlendi
                </span>
              </div>
            )}

            {film.review && (
              <div className="mt-4 flex-1 overflow-y-auto pr-1">
                <p className="watch-detail-muted text-xs font-semibold uppercase tracking-wider">
                  Yorum
                </p>
                <p
                  className="watch-detail-body mt-1.5 text-sm"
                  style={{ lineHeight: 1.6, color: "#F5F0E8" }}
                >
                  {film.review}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </ModalPortal>
  );
}
