"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ContentItem, Film, Series } from "@/types/database";
import { calculateTotalLifeSpent } from "@/lib/utils/time";
import { Film as FilmIcon, Tv, Clock, Star } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

type FilmItem = ContentItem & { film: Film | Film[] | null };
type SeriesItem = ContentItem & { series: Series | Series[] | null };

function getFilm(d: FilmItem): Film | null {
  const f = d.film;
  if (!f) return null;
  return Array.isArray(f) ? f[0] ?? null : f;
}

function getSeries(d: SeriesItem): Series | null {
  const s = d.series;
  if (!s) return null;
  return Array.isArray(s) ? s[0] ?? null : s;
}

interface CinemaPageProps {
  films: FilmItem[];
  series: SeriesItem[];
  stats: {
    totalFilms: number;
    totalSeries: number;
    totalWatchTimeMinutes: number;
    totalReviews: number;
  };
}

export function CinemaPage({ films, series, stats }: CinemaPageProps) {
  const [tab, setTab] = useState<"films" | "series">("films");

  const filmList = films.map(getFilm).filter((f): f is Film => f !== null);
  const seriesList = series.map(getSeries).filter((s): s is Series => s !== null);
  const { humanTR } = calculateTotalLifeSpent(filmList, seriesList);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        layoutId="nav-/cinema"
        title="Cinema"
        subtitle="Film & series collection"
      />

      {/* Hero stat: Total life spent */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03, duration: 0.2 }}
        className="mb-8 flex items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-6 py-5"
      >
        <div className="rounded-lg bg-[var(--accent-soft)] p-3">
          <Clock className="h-8 w-8 text-[var(--accent)]" />
        </div>
        <div>
          <p className="font-editorial text-2xl font-medium text-[var(--foreground)]">
            {humanTR}
          </p>
          <p className="text-sm text-[var(--muted)]">Total life spent watching</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.18 }}
        className="mb-8 grid gap-3 sm:grid-cols-3"
      >
        <div className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
          <FilmIcon className="h-5 w-5 text-[var(--accent)]" />
          <div>
            <p className="text-lg font-semibold">{stats.totalFilms}</p>
            <p className="text-xs text-[var(--muted)]">Films</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
          <Tv className="h-5 w-5 text-[var(--accent)]" />
          <div>
            <p className="text-lg font-semibold">{stats.totalSeries}</p>
            <p className="text-xs text-[var(--muted)]">Series</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
          <Star className="h-5 w-5 text-[var(--accent)]" />
          <div>
            <p className="text-lg font-semibold">{stats.totalReviews}</p>
            <p className="text-xs text-[var(--muted)]">Reviews</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.06, duration: 0.15 }}
        className="mb-6 flex gap-0.5 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-1"
      >
        <button
          onClick={() => setTab("films")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === "films"
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Films
        </button>
        <button
          onClick={() => setTab("series")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === "series"
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Series
        </button>
      </motion.div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {tab === "films" ? (
          <motion.div
            key="films"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {films.length === 0 ? (
              <p className="col-span-full py-8 text-center text-[var(--muted)]">
                No films yet.
              </p>
            ) : (
              films.map((item, i) => {
                const film = getFilm(item);
                if (!film) return null;
                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02, duration: 0.15 }}
                    className="overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--card)] transition hover:border-[var(--accent)]/30"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--card-border)]">
                      {film.poster_url ? (
                        <img
                          src={film.poster_url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                          <FilmIcon className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-[var(--foreground)] line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--muted)]">
                        {item.rating != null && (
                          <span className="text-[var(--accent)]">★ {item.rating}</span>
                        )}
                        {film.year && <span>{film.year}</span>}
                        <span>{film.duration_min} min</span>
                      </div>
                    </div>
                  </motion.article>
                );
              })
            )}
          </motion.div>
        ) : (
          <motion.div
            key="series"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {series.length === 0 ? (
              <p className="col-span-full py-8 text-center text-[var(--muted)]">
                No series yet.
              </p>
            ) : (
              series.map((item, i) => {
                const s = getSeries(item);
                if (!s) return null;
                const totalMins =
                  (s.avg_episode_min ?? 0) * (s.episodes_watched ?? 0);
                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02, duration: 0.15 }}
                    className="overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--card)] transition hover:border-[var(--accent)]/30"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--card-border)]">
                      <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                        <Tv className="h-12 w-12" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-[var(--foreground)] line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--muted)]">
                        {item.rating != null && (
                          <span className="text-[var(--accent)]">★ {item.rating}</span>
                        )}
                        <span>
                          {s.episodes_watched} ep
                          {s.avg_episode_min
                            ? ` × ${s.avg_episode_min} min`
                            : ""}
                        </span>
                        {totalMins > 0 && (
                          <span className="text-[var(--muted)]">
                            ({totalMins} min)
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
