import { getPublicFilms, getPublicSeries, getCinemaStats } from "@/lib/db/queries";
import { CinemaPage } from "@/components/cinema/CinemaPage";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";

export default async function CinemaRoute() {
  const [films, series, stats] = await Promise.all([
    getPublicFilms(),
    getPublicSeries(),
    getCinemaStats(),
  ]);

  return (
    <PageTransitionTarget layoutId="card-/cinema">
      <CinemaPage
        films={films}
        series={series}
        stats={{
          totalFilms: stats.totalFilms,
          totalSeries: stats.totalSeries,
          totalWatchTimeMinutes: stats.totalWatchTimeMinutes,
          totalReviews: stats.totalReviews,
        }}
      />
    </PageTransitionTarget>
  );
}
