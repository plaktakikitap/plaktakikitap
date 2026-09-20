import type { Metadata } from "next";
import Link from "next/link";
import {
  getPublicFilms,
  getPublicFavoriteFilms,
  getCinemaStats,
} from "@/lib/db/queries";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PageHeader } from "@/components/layout/PageHeader";
import { WatchLogStats } from "@/components/watch-log/WatchLogStats";
import { FavoriteVitrinFilms } from "@/components/watch-log/FavoriteVitrinFilms";
import { WatchPosterGrid } from "@/components/watch-log/WatchPosterGrid";
import { filmToPosterItem } from "@/lib/watch-log-poster";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Filmler | İzleme Günlüğüm | Plaktaki Kitap",
  description: "İzlediğim filmler ve onlara dair düşüncelerim.",
};

export default async function IzlemeGunlugumFilmlerPage() {
  let films: Awaited<ReturnType<typeof getPublicFilms>> = [];
  let favoriteFilms: Awaited<ReturnType<typeof getPublicFavoriteFilms>> = [];
  let totalFilms = 0;
  let totalFilmWatchTimeMinutes = 0;
  let filmWatchedThisYear = 0;

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
    filmWatchedThisYear = stats.filmWatchedThisYear;
  } catch {
    // empty
  }

  const posterItems = films.map(filmToPosterItem);
  const lastFilmTitle =
    posterItems.length > 0
      ? [...posterItems].sort((a, b) => {
          const ta = a.watchedAt ? new Date(a.watchedAt).getTime() : 0;
          const tb = b.watchedAt ? new Date(b.watchedAt).getTime() : 0;
          return tb - ta;
        })[0]?.title ?? null
      : null;

  return (
    <PageTransitionTarget layoutId="card-/izleme-gunlugum/filmler">
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
            thisYearCount={filmWatchedThisYear}
          />

          <FavoriteVitrinFilms films={favoriteFilms} />

          <div className="mt-8">
            <WatchPosterGrid
              items={posterItems}
              initialKind="film"
              showKindFilter={false}
            />
          </div>
        </div>
      </main>
    </PageTransitionTarget>
  );
}
