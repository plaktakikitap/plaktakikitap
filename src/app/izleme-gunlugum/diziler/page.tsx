import { getPublicSeries, getPublicFavoriteSeries, getCinemaStats } from "@/lib/db/queries";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PageHeader } from "@/components/layout/PageHeader";
import Footer from "@/components/Footer";
import { WatchLogStats } from "@/components/watch-log/WatchLogStats";
import { FavoriteVitrinSeries } from "@/components/watch-log/FavoriteVitrinSeries";
import { SeriesFilterableSection } from "@/components/watch-log/SeriesFilterableSection";
import Link from "next/link";
import type { ContentItem, Series } from "@/types/database";

export const dynamic = "force-dynamic";

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
    // Supabase not configured – show empty state
  }

  const lastSeriesTitle =
    seriesList.length > 0 ? seriesList[seriesList.length - 1].title : null;

  return (
    <PageTransitionTarget layoutId="card-/izleme-gunlugum/diziler">
      <main className="relative min-h-screen text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
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

          <WatchLogStats
            variant="series"
            lastTitle={lastSeriesTitle}
            totalCount={totalSeries}
            totalMinutes={totalSeriesWatchTimeMinutes}
            thisMonthCount={seriesWatchedThisMonth}
          />

          <FavoriteVitrinSeries seriesList={favoriteSeries} />

          <SeriesFilterableSection seriesList={seriesList} />
        </div>
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
