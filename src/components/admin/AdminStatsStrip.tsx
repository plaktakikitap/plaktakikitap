"use client";

import { useEffect, useState } from "react";
import { BookOpen, Film, Tv, Youtube } from "lucide-react";

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".", ",") + "K";
  return n.toLocaleString("tr-TR");
}

interface AdminStatsStripProps {
  totalBooks: number;
  totalFilms: number;
  totalSeries: number;
  filmWatchedThisMonth?: number;
  seriesWatchedThisMonth?: number;
  booksReadThisMonth?: number;
}

export function AdminStatsStrip({
  totalBooks,
  totalFilms,
  totalSeries,
  filmWatchedThisMonth = 0,
  seriesWatchedThisMonth = 0,
  booksReadThisMonth = 0,
}: AdminStatsStripProps) {
  const [ytSubs, setYtSubs] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/youtube/subscribers")
      .then((r) => r.json())
      .then((d: { subscriberCount?: number | null }) => {
        if (typeof d.subscriberCount === "number") setYtSubs(d.subscriberCount);
      })
      .catch(() => {});
  }, []);

  const items = [
    { icon: Film, label: "Toplam Film", value: totalFilms, sub: filmWatchedThisMonth > 0 ? `Bu ay: ${filmWatchedThisMonth}` : null },
    { icon: Tv, label: "Toplam Dizi", value: totalSeries, sub: seriesWatchedThisMonth > 0 ? `Bu ay: ${seriesWatchedThisMonth}` : null },
    { icon: BookOpen, label: "Toplam Kitap", value: totalBooks, sub: booksReadThisMonth > 0 ? `Bu ay: ${booksReadThisMonth}` : null },
    { icon: Youtube, label: "YouTube Abone", value: ytSubs != null ? ytSubs : null, sub: null },
  ];

  return (
    <div className="space-y-3">
      <h2 className="admin-heading text-lg font-medium tracking-tight text-white/95">
        Site Özeti
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(({ icon: Icon, label, value, sub }) => (
          <div
            key={label}
            className="admin-bento-card flex items-center gap-4 rounded-2xl p-5 transition-transform hover:scale-[1.01]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                {label}
              </p>
              <p className="admin-heading text-2xl font-semibold tabular-nums text-white">
                {value != null ? formatNum(value) : "—"}
              </p>
              {sub && (
                <p className="text-xs text-amber-400/80">{sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
