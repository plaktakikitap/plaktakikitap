"use client";

import { motion } from "framer-motion";
import { Tv } from "lucide-react";
import type { ContentItem, Series } from "@/types/database";

export type SeriesItem = ContentItem & { series: Series | Series[] | null };

function getSeries(d: SeriesItem): Series | null {
  const s = d.series;
  if (!s) return null;
  return Array.isArray(s) ? s[0] ?? null : s;
}

interface FavoriteVitrinSeriesProps {
  seriesList: SeriesItem[];
}

export function FavoriteVitrinSeries({ seriesList }: FavoriteVitrinSeriesProps) {
  if (seriesList.length === 0) return null;

  return (
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
        {seriesList.map((item, i) => {
          const s = getSeries(item);
          if (!s) return null;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.1 }}
              className="group flex flex-col items-center"
            >
              <div
                className="relative flex overflow-hidden rounded-md border-2 border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all duration-300 group-hover:border-amber-300 group-hover:shadow-[0_0_28px_rgba(251,191,36,0.35)]"
                style={{ width: "clamp(80px, 18vw, 140px)" }}
              >
                <div className="aspect-[2/3] w-full bg-gradient-to-b from-amber-950/50 to-black/60 flex flex-col items-center justify-center p-2">
                  <Tv className="h-10 w-10 text-amber-400/70 sm:h-12 sm:w-12" />
                  <p className="mt-2 line-clamp-3 text-center font-editorial text-sm font-medium text-white/95">
                    {item.title}
                  </p>
                </div>
              </div>
              <span className="mt-2 rounded-full border border-amber-400/40 bg-amber-950/30 px-2.5 py-0.5 font-serif text-[10px] uppercase tracking-wider text-amber-200/90 backdrop-blur-sm sm:text-xs">
                Eymen&apos;in Seçimi
              </span>
              <div className="mt-1.5 flex flex-col items-center gap-0.5 font-editorial text-[11px] text-white/70 sm:text-xs">
                <span>Bölüm: {s.episodes_watched}</span>
                <span>Sezon: {s.seasons_watched > 0 ? `${s.seasons_watched} izlendi` : "—"}{s.total_seasons != null ? ` / ${s.total_seasons} toplam` : ""}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
