"use client";

import { motion } from "framer-motion";
import type { ContentItem } from "@/types/database";
import type { Film } from "@/types/database";

type FilmWithDetails = ContentItem & {
  film: Film | Film[] | null;
};

function getFilm(d: FilmWithDetails): Film | null {
  const f = d.film;
  if (!f) return null;
  return Array.isArray(f) ? f[0] ?? null : f;
}

export function FilmCard({
  item,
  index,
}: {
  item: FilmWithDetails;
  index: number;
}) {
  const film = getFilm(item);
  if (!film) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-sm transition hover:shadow-md"
    >
      {film.poster_url && (
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--card-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={film.poster_url}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-[var(--foreground)]">{item.title}</h3>
        <div className="mt-1 flex gap-2 text-sm text-[var(--muted)]">
          {film.year && <span>{film.year}</span>}
          <span>•</span>
          <span>{film.duration_min} dk</span>
        </div>
        {item.rating != null && (
          <p className="mt-1 text-sm text-[var(--accent)]">★ {item.rating}</p>
        )}
        {item.description && (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
            {item.description}
          </p>
        )}
      </div>
    </motion.article>
  );
}
