import type { Metadata } from "next";
import {
  getPublicFilms,
  getPublicSeries,
  getCinemaStats,
} from "@/lib/db/queries";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PageHeader } from "@/components/layout/PageHeader";
import { WatchLogStats } from "@/components/watch-log/WatchLogStats";
import { WatchPosterGrid } from "@/components/watch-log/WatchPosterGrid";
import {
  filmToPosterItem,
  seriesToPosterItem,
  type WatchPosterItem,
} from "@/lib/watch-log-poster";
import { SonYorumlarim } from "@/components/son-yorumlarim/SonYorumlarim";
import { watchItemsToSonYorumlar } from "@/lib/son-yorumlarim";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İzleme Günlüğüm | Plaktaki Kitap",
  description: "İzlediğim filmler ve diziler, onlara dair düşüncelerim.",
};

export default async function IzlemeGunlugumPage() {
  let items: WatchPosterItem[] = [];
  let totalFilms = 0;
  let totalSeries = 0;
  let totalFilmMinutes = 0;
  let totalSeriesMinutes = 0;
  let filmThisYear = 0;
  let lastTitle: string | null = null;

  try {
    const [films, seriesList, stats] = await Promise.all([
      getPublicFilms(),
      getPublicSeries(),
      getCinemaStats(),
    ]);
    items = [
      ...films.map(filmToPosterItem),
      ...seriesList.map(seriesToPosterItem),
    ];
    totalFilms = stats.totalFilms;
    totalSeries = stats.totalSeries;
    totalFilmMinutes = stats.totalFilmWatchTimeMinutes;
    totalSeriesMinutes = stats.totalSeriesWatchTimeMinutes;
    filmThisYear = stats.filmWatchedThisYear;
    const newest = [...items].sort((a, b) => {
      const ta = a.watchedAt ? new Date(a.watchedAt).getTime() : 0;
      const tb = b.watchedAt ? new Date(b.watchedAt).getTime() : 0;
      return tb - ta;
    })[0];
    lastTitle = newest?.title ?? null;
  } catch {
    // empty
  }

  const sonYorumlar = watchItemsToSonYorumlar(items, "izleme");

  return (
    <PageTransitionTarget layoutId="card-/izleme-gunlugum">
      <main className="relative min-h-screen text-white">
        <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-10">
          <PageHeader
            layoutId="nav-/izleme-gunlugum"
            title="İzleme Günlüğüm"
            titleClassName="!text-white font-bold"
            subtitle="izlediğim filmler, diziler ve onlara dair düşüncelerim"
            subtitleClassName="text-white/70"
          />

          <div className="mt-8">
            <SonYorumlarim items={sonYorumlar} tip="izleme" />
          </div>

          <WatchLogStats
            variant="film"
            lastTitle={lastTitle}
            totalCount={totalFilms + totalSeries}
            totalMinutes={totalFilmMinutes + totalSeriesMinutes}
            thisYearCount={filmThisYear}
          />

          <div className="mt-8">
            <WatchPosterGrid items={items} showKindFilter />
          </div>
        </div>
      </main>
    </PageTransitionTarget>
  );
}
