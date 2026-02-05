"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ContentItem, Series } from "@/types/database";
import { SeriesDetailModal } from "./SeriesDetailModal";

export type SeriesItem = ContentItem & { series: Series | Series[] | null };

function getSeries(d: SeriesItem): Series | null {
  const s = d.series;
  if (!s) return null;
  return Array.isArray(s) ? s[0] ?? null : s;
}

const LAYOUT_SPRING = { type: "spring" as const, stiffness: 320, damping: 32 };

interface SeriesCollectionWithModalProps {
  seriesList: SeriesItem[];
}

export function SeriesCollectionWithModal({ seriesList }: SeriesCollectionWithModalProps) {
  const [selected, setSelected] = useState<SeriesItem | null>(null);

  if (seriesList.length === 0) {
    return (
      <p className="py-12 text-center text-white/50">
        Henüz dizi eklenmemiş. Admin panelinden ekleyebilirsiniz.
      </p>
    );
  }

  return (
    <>
      <motion.ul
        layout
        transition={LAYOUT_SPRING}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {seriesList.map((item) => {
          const series = getSeries(item);
          if (!series) return null;
          const totalMin =
            series.total_duration_min ??
            (series.episodes_watched ?? 0) * (series.avg_episode_min ?? 0);
          return (
            <motion.li
              key={item.id}
              layout="position"
              transition={LAYOUT_SPRING}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="list-none"
            >
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10"
              >
                <p className="font-medium text-white/95">{item.title}</p>
                <p className="mt-1 text-xs text-white/60">
                  {series.episodes_watched} bölüm
                  {series.seasons_watched > 0 && ` · ${series.seasons_watched} sezon`}
                  {series.total_seasons != null && ` / ${series.total_seasons} toplam`}
                  {totalMin > 0 && ` · ${totalMin} dk`}
                </p>
                {item.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-white/70">
                    {item.description}
                  </p>
                )}
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
      <AnimatePresence>
        <SeriesDetailModal item={selected} onClose={() => setSelected(null)} />
      </AnimatePresence>
    </>
  );
}
