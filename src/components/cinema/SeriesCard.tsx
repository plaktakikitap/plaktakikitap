"use client";

import { motion } from "framer-motion";
import type { ContentItem } from "@/types/database";
import type { Series } from "@/types/database";

type SeriesWithDetails = ContentItem & {
  series: Series | Series[] | null;
};

function getSeries(d: SeriesWithDetails): Series | null {
  const s = d.series;
  if (!s) return null;
  return Array.isArray(s) ? s[0] ?? null : s;
}

export function SeriesCard({
  item,
  index,
}: {
  item: SeriesWithDetails;
  index: number;
}) {
  const series = getSeries(item);
  if (!series) return null;

  const totalMins =
    (series.avg_episode_min ?? 0) * (series.episodes_watched ?? 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm transition hover:shadow-md"
    >
      <h3 className="font-semibold text-[var(--foreground)]">{item.title}</h3>
      <div className="mt-1 flex flex-wrap gap-2 text-sm text-[var(--muted)]">
        <span>{series.episodes_watched} bölüm</span>
        {series.seasons_watched > 0 && (
          <>
            <span>•</span>
            <span>{series.seasons_watched} sezon</span>
          </>
        )}
        {series.avg_episode_min && (
          <>
            <span>•</span>
            <span>~{totalMins} dk toplam</span>
          </>
        )}
      </div>
      {item.rating != null && (
        <p className="mt-1 text-sm text-[var(--accent)]">★ {item.rating}</p>
      )}
      {item.description && (
        <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
          {item.description}
        </p>
      )}
    </motion.article>
  );
}
