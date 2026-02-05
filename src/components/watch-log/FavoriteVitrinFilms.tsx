"use client";

import { motion } from "framer-motion";
import { Film as FilmIcon } from "lucide-react";
import type { ContentItem, Film } from "@/types/database";
import { FilmDetailModal } from "./FilmDetailModal";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

export type FilmItem = ContentItem & { film: Film | Film[] | null };

function getFilm(d: FilmItem): Film | null {
  const f = d.film;
  if (!f) return null;
  return Array.isArray(f) ? f[0] ?? null : f;
}

interface FavoriteVitrinFilmsProps {
  films: FilmItem[];
  onSelectFilm?: (item: FilmItem | null) => void;
}

export function FavoriteVitrinFilms({ films, onSelectFilm }: FavoriteVitrinFilmsProps) {
  const [selectedFilm, setSelectedFilm] = useState<FilmItem | null>(null);
  const handleSelect = (item: FilmItem | null) => {
    if (onSelectFilm) {
      onSelectFilm(item);
    } else {
      setSelectedFilm(item);
    }
  };
  const showingModal = onSelectFilm ? null : selectedFilm;

  if (films.length === 0) return null;

  return (
    <>
      <section
        className="relative mb-10 overflow-hidden rounded-2xl py-8 px-4 sm:px-6"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251,191,36,0.12) 0%, transparent 55%)",
        }}
      >
        <h2 className="mb-6 text-center font-editorial text-xl font-medium text-white/90 sm:text-2xl">
          Eymen&apos;in Favori 5&apos;lisi
        </h2>
        <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
          {films.map((item, i) => {
            const film = getFilm(item);
            if (!film) return null;
            const coverUrl = film.poster_url;

            return (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => handleSelect(item)}
                className="group flex flex-col items-center text-left"
              >
                <div
                  className="relative overflow-hidden rounded-md border-2 border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all duration-300 group-hover:border-amber-300 group-hover:shadow-[0_0_28px_rgba(251,191,36,0.35)]"
                  style={{ width: "clamp(80px, 18vw, 140px)" }}
                >
                  <div className="aspect-[2/3] w-full bg-black/40">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={item.title}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/30">
                        <FilmIcon className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </div>
                <span className="mt-2 rounded-full border border-amber-400/40 bg-amber-950/30 px-2.5 py-0.5 font-serif text-[10px] uppercase tracking-wider text-amber-200/90 backdrop-blur-sm sm:text-xs">
                  Eymen&apos;in Seçimi
                </span>
                <p className="mt-1 max-w-[clamp(80px,18vw,140px)] truncate text-center text-xs text-white/80 group-hover:text-white/95">
                  {item.title}
                </p>
              </motion.button>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {showingModal && (
          <FilmDetailModal
            item={showingModal}
            onClose={() => handleSelect(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
