"use client";

import { motion } from "framer-motion";
import { formatWatchTimeYilAyGunSaat } from "@/lib/utils/time";
import { Film as FilmIcon, Tv, Clock, Calendar, BarChart3 } from "lucide-react";

export type WatchLogVariant = "film" | "series";

interface WatchLogStatsProps {
  variant: WatchLogVariant;
  lastTitle: string | null;
  totalCount: number;
  totalMinutes: number;
  /** Bu ay izlenen (watched_at in current month) */
  thisMonthCount?: number;
}

export function WatchLogStats({
  variant,
  lastTitle,
  totalCount,
  totalMinutes,
  thisMonthCount = 0,
}: WatchLogStatsProps) {
  const totalTimeStr = formatWatchTimeYilAyGunSaat(totalMinutes);
  const averageMinutes = totalCount > 0 ? Math.round(totalMinutes / totalCount) : 0;
  const averageTimeStr = formatWatchTimeYilAyGunSaat(averageMinutes);

  const label = variant === "film" ? "film" : "dizi";
  const labelPlural = variant === "film" ? "film" : "dizi";
  const Icon = variant === "film" ? FilmIcon : Tv;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-stretch"
    >
      {/* Son İzlediğim */}
      <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm sm:min-w-[200px]">
        <p className="text-xs uppercase tracking-wider text-white/50">
          Son İzlediğim
        </p>
        <p className="mt-1 truncate font-medium text-white/95">
          {lastTitle ?? "—"}
        </p>
      </div>

      {/* Toplam: X film/dizi */}
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
        <Icon className="h-6 w-6 shrink-0 text-amber-400/80" aria-hidden />
        <div>
          <p className="text-2xl font-semibold tabular-nums text-white">
            {totalCount}
          </p>
          <p className="text-xs text-white/60">Toplam {labelPlural}</p>
        </div>
      </div>

      {/* Toplam süre */}
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
        <Clock className="h-6 w-6 shrink-0 text-amber-400/80" aria-hidden />
        <div>
          <p className="text-xs text-white/60">Toplam süre</p>
          <p className="mt-0.5 font-medium text-white/95">{totalTimeStr}</p>
        </div>
      </div>

      {/* Ortalama süre */}
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
        <BarChart3 className="h-6 w-6 shrink-0 text-amber-400/80" aria-hidden />
        <div>
          <p className="text-xs text-white/60">Ortalama süre ({label} başına)</p>
          <p className="mt-0.5 font-medium text-white/95">{averageTimeStr}</p>
        </div>
      </div>

      {/* Bu ay izlenen */}
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
        <Calendar className="h-6 w-6 shrink-0 text-amber-400/80" aria-hidden />
        <div>
          <p className="text-xs text-white/60">Bu ay izlenen</p>
          <p className="mt-0.5 font-semibold tabular-nums text-white/95">
            {thisMonthCount}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
