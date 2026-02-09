"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { ContentItem, Film } from "@/types/database";
import { Film as FilmIcon } from "lucide-react";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { FilmDetailModal } from "./FilmDetailModal";
import styles from "./WatchLogGrid.module.css";

const LAYOUT_SPRING = { type: "spring" as const, stiffness: 320, damping: 32 };

type FilmItem = ContentItem & { film: Film | Film[] | null };

function getFilm(d: FilmItem): Film | null {
  const f = d.film;
  if (!f) return null;
  return Array.isArray(f) ? f[0] ?? null : f;
}

/** Deterministic micro imperfections: rotation -0.6° to +0.6°, translateY 0–2px */
function getSpineMicro(id: string): { rotation: number; translateY: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  const u = Math.abs(h);
  const rotation = -0.6 + (u % 13) / 10;
  const translateY = (u % 3);
  return { rotation, translateY };
}

interface WatchLogGridProps {
  films: FilmItem[];
  /** When set, parent controls the detail modal (e.g. shared with FavoriteVitrin). */
  onSelectFilm?: (item: FilmItem | null) => void;
}

export function WatchLogGrid({ films, onSelectFilm }: WatchLogGridProps) {
  const [internalSelected, setInternalSelected] = useState<FilmItem | null>(null);
  const selectedFilm = onSelectFilm !== undefined ? null : internalSelected;
  const setSelectedFilm = onSelectFilm ?? setInternalSelected;
  const handleSelect = (item: FilmItem) => {
    if (onSelectFilm) onSelectFilm(item);
    else setInternalSelected(item);
  };
  const handleClose = () => {
    if (onSelectFilm) onSelectFilm(null);
    else setInternalSelected(null);
  };

  if (films.length === 0) {
    return (
      <p className="py-12 text-center text-white/50">
        Henüz film eklenmemiş. Admin panelinden ekleyebilirsiniz.
      </p>
    );
  }

  return (
    <>
      <LayoutGroup>
        <div className="relative">
          <motion.div
            layout
            transition={LAYOUT_SPRING}
            className="flex flex-wrap items-end justify-center gap-0 pt-6 pb-0 sm:gap-0.5"
          >
            {films.map((item, i) => {
              const film = getFilm(item);
              if (!film) return null;
              const spineImage =
                film.spine_url ??
                film.poster_url ??
                `/api/watch-log/default-spine?title=${encodeURIComponent(item.title)}`;
              const micro = getSpineMicro(item.id);

              return (
                <motion.article
                  key={item.id}
                  layout="position"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{
                    opacity: 1,
                    y: micro.translateY,
                    rotate: micro.rotation,
                  }}
                  transition={{
                    layout: LAYOUT_SPRING,
                    opacity: { duration: 0.2 },
                    y: { duration: 0.2 },
                    rotate: { duration: 0 },
                  }}
                  style={{ rotate: micro.rotation, y: micro.translateY }}
                  className="group relative flex flex-col items-center"
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="flex flex-col items-center text-left"
                  >
                    <motion.div
                      layout={false}
                      whileHover={{
                        y: -14,
                        transition: { duration: 0.2 },
                      }}
                      className={styles.spineCard}
                    >
                    <div className={styles.spineCardInner}>
                      {spineImage ? (
                        <img
                          src={spineImage}
                          alt=""
                          className={styles.spineImage}
                          width={82}
                          height={430}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.spinePlaceholder}>
                          <FilmIcon className="h-8 w-8" aria-hidden />
                        </div>
                      )}
                    </div>
                  </motion.div>
                {/* Başlık + puan: spine altında, matches spine width to avoid shift */}
                <p
                  className={`${styles.spineTitle} mt-2 origin-top truncate text-center text-[10px] leading-tight text-white/70 group-hover:text-white/90 sm:text-xs`}
                  title={item.title}
                >
                  {item.title}
                </p>
                {(film.rating_5 != null || item.rating != null) && (
                  <div className="mt-0.5 origin-top">
                    <StarRatingDisplay
                      value={film.rating_5 ?? (item.rating != null ? item.rating / 2 : null)}
                      size="sm"
                      className="text-amber-400/90"
                    />
                  </div>
                )}
              </button>
                </motion.article>
              );
            })}
          </motion.div>
          <div className={styles.shelfBase} aria-hidden role="presentation" />
        </div>
      </LayoutGroup>

      {!onSelectFilm && (
        <AnimatePresence>
          {internalSelected && (
            <FilmDetailModal
              key={internalSelected.id}
              item={internalSelected}
              onClose={handleClose}
            />
          )}
        </AnimatePresence>
      )}
    </>
  );
}
