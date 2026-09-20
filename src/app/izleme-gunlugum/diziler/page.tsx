import type { Metadata } from "next";
import Link from "next/link";
import {
  getPublicSeries,
  getPublicFavoriteSeries,
  getCinemaStats,
} from "@/lib/db/queries";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PageHeader } from "@/components/layout/PageHeader";
import { WatchLogStats } from "@/components/watch-log/WatchLogStats";
import { FavoriteVitrinSeries } from "@/components/watch-log/FavoriteVitrinSeries";
import { WatchPosterGrid } from "@/components/watch-log/WatchPosterGrid";
import { seriesToPosterItem } from "@/lib/watch-log-poster";
import type { ContentItem, Series } from "@/types/database";
import { SonYorumlarim } from "@/components/son-yorumlarim/SonYorumlarim";
import { watchItemsToSonYorumlar } from "@/lib/son-yorumlarim";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Diziler | İzleme Günlüğüm | Plaktaki Kitap",
  description: "İzlediğim diziler ve onlara dair düşüncelerim.",
};

type SeriesItem = ContentItem & { series: Series | Series[] | null };

export default async function IzlemeGunlugumDizilerPage() {
  let seriesList: SeriesItem[] = [];
  let favoriteSeries: SeriesItem[] = [];
  let totalSeries = 0;
  let totalSeriesWatchTimeMinutes = 0;
  let seriesWatchedThisMonth = 0;

  try {
    const [seriesData, favoriteData, stats] = await Promise.all([
      getPublicSeries(),
      getPublicFavoriteSeries(),
      getCinemaStats(),
    ]);
    seriesList = seriesData;
    favoriteSeries = favoriteData;
    totalSeries = stats.totalSeries;
    totalSeriesWatchTimeMinutes = stats.totalSeriesWatchTimeMinutes;
    seriesWatchedThisMonth = stats.seriesWatchedThisMonth;
  } catch {
    // empty
  }

  const posterItems = seriesList.map(seriesToPosterItem);
  const sonYorumlar = watchItemsToSonYorumlar(posterItems, "dizi");
  const lastSeriesTitle =
    posterItems.length > 0
      ? [...posterItems].sort((a, b) => {
          const ta = a.watchedAt ? new Date(a.watchedAt).getTime() : 0;
          const tb = b.watchedAt ? new Date(b.watchedAt).getTime() : 0;
          return tb - ta;
        })[0]?.title ?? null
      : null;

  return (
    <PageTransitionTarget layoutId="card-/izleme-gunlugum/diziler">
      <main className="relative min-h-screen text-white">
        <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-10">
          <div className="mb-6 sm:mb-8">
            <Link
              href="/izleme-gunlugum"
              className="text-sm text-white/60 transition-colors hover:text-white/90"
            >
              ← İzleme Günlüğüm
            </Link>
          </div>
          <PageHeader
            layoutId="nav-/izleme-gunlugum/diziler"
            title="Diziler"
            titleClassName="!text-white font-bold"
            subtitle="izlediğim diziler ve yorumlarım"
            subtitleClassName="text-white/70"
          />

          <div className="mt-8">
            <SonYorumlarim items={sonYorumlar} tip="dizi" />
          </div>

          <WatchLogStats
            variant="series"
            lastTitle={lastSeriesTitle}
            totalCount={totalSeries}
            totalMinutes={totalSeriesWatchTimeMinutes}
            thisMonthCount={seriesWatchedThisMonth}
          />

          <FavoriteVitrinSeries seriesList={favoriteSeries} />

          <div className="mt-8">
            <WatchPosterGrid
              items={posterItems}
              initialKind="series"
              showKindFilter={false}
            />
          </div>
        </div>
      </main>
    </PageTransitionTarget>
  );
}
