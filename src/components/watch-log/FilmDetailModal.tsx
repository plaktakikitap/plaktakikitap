"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ContentItem, Film } from "@/types/database";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { Film as FilmIcon } from "lucide-react";

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

  const coverUrl = film.poster_url;
  const ratingValue =
    film.rating_5 ?? (item.rating != null ? item.rating / 2 : null);
  const genreTags = film.genre_tags ?? [];

  return (
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
      {/* Backdrop: click to close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden
      />

      {/* Modal panel: premium entrance/exit */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 12 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        {/* Left: cover (fixed ratio), subtle border */}
        <div className="relative w-[42%] min-w-[140px] shrink-0 sm:min-w-[180px]">
          <div className="aspect-[2/3] w-full overflow-hidden border-r border-white/10 bg-black/30">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/30">
                <FilmIcon className="h-20 w-20" aria-hidden />
              </div>
            )}
          </div>
        </div>

        {/* Right: title, director, genres, duration, rating, review */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-white/70 transition hover:bg-white/15 hover:text-white"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>

          <h2
            id="film-modal-title"
            className="pr-8 font-editorial text-xl font-semibold leading-tight text-white sm:text-2xl"
          >
            {item.title}
          </h2>

          {film.director && (
            <p className="mt-2 text-sm text-white/80">
              <span className="text-white/55">Yönetmen:</span> {film.director}
            </p>
          )}

          {genreTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {genreTags.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          <p className="mt-2 text-sm text-white/75">
            <span className="text-white/55">Süre:</span> {film.duration_min} dk
            {film.year != null && (
              <span className="ml-2 text-white/55">· {film.year}</span>
            )}
          </p>

          {ratingValue != null && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-white/55">Puan:</span>
              <StarRatingDisplay
                value={ratingValue}
                size="lg"
                className="text-amber-400"
              />
              <span className="text-sm text-white/60">({ratingValue} / 5)</span>
            </div>
          )}

          {film.review && (
            <div className="mt-4 flex-1 overflow-y-auto pr-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Yorum
              </p>
              <p
                className="mt-1.5 text-sm text-white/90"
                style={{ lineHeight: 1.6 }}
              >
                {film.review}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
