import { getPublicFilms, getPublicFavoriteFilms, getCinemaStats } from "@/lib/db/queries";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PageHeader } from "@/components/layout/PageHeader";
import Footer from "@/components/Footer";
import { WatchLogStats } from "@/components/watch-log/WatchLogStats";
import { FilmlerPageContent } from "@/components/watch-log/FilmlerPageContent";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function IzlemeGunlugumFilmlerPage() {
  let films: Awaited<ReturnType<typeof getPublicFilms>> = [];
  let favoriteFilms: Awaited<ReturnType<typeof getPublicFavoriteFilms>> = [];
  let totalFilms = 0;
  let totalFilmWatchTimeMinutes = 0;
  let filmWatchedThisMonth = 0;

  try {
    const [filmsData, favoriteData, stats] = await Promise.all([
      getPublicFilms(),
      getPublicFavoriteFilms(),
      getCinemaStats(),
    ]);
    films = filmsData;
    favoriteFilms = favoriteData;
    totalFilms = stats.totalFilms;
    totalFilmWatchTimeMinutes = stats.totalFilmWatchTimeMinutes;
    filmWatchedThisMonth = stats.filmWatchedThisMonth;
  } catch {
    // Supabase not configured – show empty state
  }

  const lastFilmTitle =
    films.length > 0 ? films[films.length - 1].title : null;

  return (
    <PageTransitionTarget layoutId="card-/izleme-gunlugum/filmler">
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
            layoutId="nav-/izleme-gunlugum/filmler"
            title="Filmler"
            titleClassName="!text-white font-bold"
            subtitle="izlediğim filmler ve yorumlarım"
            subtitleClassName="text-white/70"
          />

          <WatchLogStats
            variant="film"
            lastTitle={lastFilmTitle}
            totalCount={totalFilms}
            totalMinutes={totalFilmWatchTimeMinutes}
            thisMonthCount={filmWatchedThisMonth}
          />

          <FilmlerPageContent films={films} favoriteFilms={favoriteFilms} />
        </div>
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
