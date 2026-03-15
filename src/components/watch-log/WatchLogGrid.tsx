"use client";

import { useState, useRef, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { ContentItem, Film } from "@/types/database";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { FilmDetailModal } from "./FilmDetailModal";
import styles from "./WatchLogGrid.module.css";

const LAYOUT_SPRING = { type: "spring" as const, stiffness: 320, damping: 32 };
const ROW_SLOP_PX = 15;

type FilmItem = ContentItem & { film: Film | Film[] | null };

function getFilm(d: FilmItem): Film | null {
  const f = d.film;
  if (!f) return null;
  return Array.isArray(f) ? f[0] ?? null : f;
}

function measureShelfTops(containerEl: HTMLElement): number[] {
  const items = containerEl.querySelectorAll<HTMLElement>("[data-film-item]");
  if (items.length === 0) return [];
  const containerRect = containerEl.getBoundingClientRect();
  const rows: number[] = [];
  let currentRowTop = -1;
  let currentRowBottom = -1;
  for (let i = 0; i < items.length; i++) {
    const r = items[i].getBoundingClientRect();
    const top = r.top - containerRect.top;
    const bottom = r.bottom - containerRect.top;
    if (currentRowTop < 0 || Math.abs(top - currentRowTop) > ROW_SLOP_PX) {
      if (currentRowBottom >= 0) rows.push(currentRowBottom);
      currentRowTop = top;
      currentRowBottom = bottom;
    } else {
      currentRowBottom = Math.max(currentRowBottom, bottom);
    }
  }
  if (currentRowBottom >= 0) rows.push(currentRowBottom);
  return rows;
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
  const [shelfTops, setShelfTops] = useState<number[]>([]);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(() => new Set());
  const containerRef = useRef<HTMLDivElement>(null);

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

  const updateShelfTops = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const tops = measureShelfTops(el);
    setShelfTops((prev) =>
      prev.length === tops.length && prev.every((t, i) => Math.abs(t - tops[i]) < 2) ? prev : tops
    );
  }, []);

  useLayoutEffect(() => {
    updateShelfTops();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateShelfTops);
    ro.observe(el);
    const t = window.setTimeout(updateShelfTops, 700);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [films.length, updateShelfTops]);

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
        <div ref={containerRef} className="relative">
          <motion.div
            layout
            transition={LAYOUT_SPRING}
            className="flex flex-wrap items-end justify-center gap-x-0 gap-y-16 pt-6 pb-0"
          >
            {films.map((item, i) => {
              const film = getFilm(item);
              if (!film) return null;
              const totalViews = 1 + (film.rewatch_count ?? 0);
              const hasImage = film.spine_url || film.poster_url;
              const usePlaceholder =
                !hasImage || failedImageIds.has(item.id);
              const spineImage = usePlaceholder ? null : (film.spine_url ?? film.poster_url ?? null);
              const micro = getSpineMicro(item.id);

              return (
                <motion.article
                  key={item.id}
                  data-film-item
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
                      className={`${styles.spineCard} ${usePlaceholder ? styles.spineCardPlaceholder : ""}`}
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
                            onError={() => setFailedImageIds((prev) => new Set(prev).add(item.id))}
                          />
                        ) : (
                          <div className={styles.spinePlaceholder}>
                            <span className={styles.spinePlaceholderTitle} aria-hidden>
                              {item.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                    <p
                      className={`${styles.spineTitle} mt-2 origin-top truncate text-center text-[10px] leading-tight text-white/70 group-hover:text-white/90 sm:text-xs`}
                      title={item.title}
                    >
                      {item.title}
                    </p>
                    {totalViews > 1 && (
                      <span className="mt-0.5 inline-block rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-medium text-white/70">
                        x{totalViews}
                      </span>
                    )}
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
          {shelfTops.map((topPx, idx) => (
            <div
              key={idx}
              className={styles.shelfBase}
              style={{ bottom: "auto", top: `${topPx}px` }}
              aria-hidden
              role="presentation"
            />
          ))}
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
