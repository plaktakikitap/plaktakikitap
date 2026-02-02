"use client";

import { motion } from "framer-motion";
import { minutesToHuman } from "@/lib/utils/time";
import { Film, BookOpen, Clock, Star } from "lucide-react";

interface HomeStatsStripProps {
  totalFilms: number;
  totalSeries: number;
  totalBooks: number;
  totalWatchTimeMinutes: number;
  totalReviews: number;
}

export function HomeStatsStrip({
  totalFilms,
  totalSeries,
  totalBooks,
  totalWatchTimeMinutes,
  totalReviews,
}: HomeStatsStripProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2 }}
      className="border-y border-[var(--card-border)] bg-[var(--card)] px-4 py-8"
    >
      <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-8 md:gap-16">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--accent-soft)] p-2">
            <Film className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div>
            <p className="font-editorial text-2xl font-medium">{totalFilms}</p>
            <p className="text-sm text-[var(--muted)]">Film</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--accent-soft)] p-2">
            <Film className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{totalSeries}</p>
            <p className="text-sm text-[var(--muted)]">Dizi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--accent-soft)] p-2">
            <BookOpen className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div>
            <p className="font-editorial text-2xl font-medium">{totalBooks}</p>
            <p className="text-sm text-[var(--muted)]">Kitap</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--accent-soft)] p-2">
            <Clock className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div>
            <p className="font-editorial text-2xl font-medium">
              {minutesToHuman(totalWatchTimeMinutes)}
            </p>
            <p className="text-sm text-[var(--muted)]">İzleme süresi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--accent-soft)] p-2">
            <Star className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div>
            <p className="font-editorial text-2xl font-medium">{totalReviews}</p>
            <p className="text-sm text-[var(--muted)]">İnceleme</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
