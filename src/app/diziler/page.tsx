import type { Metadata } from "next";
import Link from "next/link";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PageHeader } from "@/components/layout/PageHeader";
import { SeriesGrid } from "@/components/series/SeriesGrid";
import { WatchLogStats } from "@/components/watch-log/WatchLogStats";
import { getPublicSeriesGrid } from "@/lib/series-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Diziler | İzleme Günlüğüm | Plaktaki Kitap",
  description: "İzlediğim diziler ve onlara dair düşüncelerim.",
};

export default async function DizilerPage() {
  let series: Awaited<ReturnType<typeof getPublicSeriesGrid>> = [];
  try {
    series = await getPublicSeriesGrid();
  } catch (error) {
    console.error("Diziler grid:", error);
  }

  const totalMinutes = series.reduce(
    (acc, s) => acc + (s.totalWatchedMinutes || 0),
    0
  );
  const year = new Date().getFullYear();
  const thisYearCount = series.filter((s) => {
    if (!s.lastWatchedAt) return false;
    return new Date(s.lastWatchedAt).getFullYear() === year;
  }).length;

  const lastByDate = [...series].sort((a, b) => {
    const ta = a.lastWatchedAt ? new Date(a.lastWatchedAt).getTime() : 0;
    const tb = b.lastWatchedAt ? new Date(b.lastWatchedAt).getTime() : 0;
    return tb - ta;
  })[0];
  const lastTitle =
    lastByDate?.lastWatchedAt
      ? lastByDate.title
      : series.find(
          (s) => s.watchStatus === "watching" || s.watchStatus === "rewatching"
        )?.title ?? null;

  return (
    <PageTransitionTarget layoutId="card-/diziler">
      <main className="relative min-h-screen text-ink">
        <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-10">
          <div className="mb-6 sm:mb-8">
            <Link
              href="/izleme-gunlugum"
              className="text-sm text-ink/60 transition-colors hover:text-ink/90"
            >
              ← İzleme Günlüğüm
            </Link>
          </div>
          <PageHeader
            layoutId="nav-/diziler"
            title="Diziler"
            titleClassName="!text-ink font-bold"
            subtitle="İzlediğim diziler ve yorumlarım"
            subtitleClassName="text-ink/70"
          />
          <WatchLogStats
            variant="series"
            lastTitle={lastTitle}
            totalCount={series.length}
            totalMinutes={totalMinutes}
            thisYearCount={thisYearCount}
          />
          <SeriesGrid series={series} />
        </div>
      </main>
    </PageTransitionTarget>
  );
}
