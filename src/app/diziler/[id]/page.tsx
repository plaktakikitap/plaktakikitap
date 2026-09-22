import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { SeasonAccordion } from "@/components/series/SeasonAccordion";
import { isAdminApiAuthorized } from "@/lib/admin/requireAdminApi";
import { getPublicSeriesById, getPublicSeriesDetail } from "@/lib/series-catalog";
import {
  seriesBarIsFull,
  seriesBarRatio,
  seriesOriginLabel,
  seriesProgressColor,
  translateGenre,
} from "@/lib/series-progress";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function watchedMinutesLabel(mins: number): string {
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  if (hours <= 0) return `${rest} dakika`;
  return `${hours} saat ${rest} dakika`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const series = await getPublicSeriesById(id);
  if (!series) return { title: "Dizi | Plaktaki Kitap" };
  return {
    title: `${series.title} | Diziler | Plaktaki Kitap`,
    description: `${series.title}${series.year ? ` (${series.year})` : ""}`,
  };
}

export default async function DiziDetayPage({ params }: Props) {
  const { id } = await params;
  const [series, canEdit] = await Promise.all([
    getPublicSeriesDetail(id),
    isAdminApiAuthorized(undefined, { allowDevBypass: false }),
  ]);
  if (!series) notFound();

  const ratio = seriesBarRatio(series);
  const width = seriesBarIsFull(series) ? 100 : Math.round(ratio * 100);
  const color = seriesProgressColor(series);
  const origin = seriesOriginLabel(series.originCountry);
  const progressPct = Math.round((series.progress || 0) * 100);
  const showOriginal =
    Boolean(series.originalTitle) &&
    series.originalTitle!.trim().toLowerCase() !== series.title.trim().toLowerCase();

  const meta = [
    series.year,
    origin,
    series.totalSeasons ? `${series.totalSeasons} sezon` : null,
    series.totalEpisodes ? `${series.totalEpisodes} bölüm` : null,
    series.episodeRuntime ? `~${series.episodeRuntime} dk/bölüm` : null,
  ].filter(Boolean);

  return (
    <PageTransitionTarget layoutId="card-/diziler">
      <main className="relative min-h-screen text-ink">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <Link
            href="/diziler"
            className="text-sm text-ink/60 transition-colors hover:text-ink/90"
          >
            ← Diziler
          </Link>

          {series.backdropUrl ? (
            <div className="relative -mx-4 mb-8 mt-6 h-48 overflow-hidden sm:mx-0 sm:h-64 sm:rounded-xl">
              <Image
                src={series.backdropUrl}
                alt=""
                fill
                sizes="(max-width:896px) 100vw, 896px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--cream)] via-[var(--cream)]/50 to-transparent" />
            </div>
          ) : (
            <div className="mt-8" />
          )}

          <div className="mb-10 flex gap-6">
            {series.posterUrl ? (
              <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-lg shadow-md sm:h-52 sm:w-36">
                <Image
                  src={series.posterUrl}
                  alt={series.title}
                  fill
                  sizes="144px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : null}

            <div className="min-w-0 flex-1">
              <h1 className="font-editorial text-2xl font-bold text-ink sm:text-3xl">
                {series.title}
              </h1>
              {showOriginal ? (
                <p className="mb-2 text-sm text-ink/50">{series.originalTitle}</p>
              ) : null}

              <div className="mb-3 mt-1 flex flex-wrap gap-x-2 gap-y-1 text-sm text-ink/50">
                {meta.map((item, i) => (
                  <span key={`${item}-${i}`}>
                    {i > 0 ? <span className="mr-2 text-ink/25">·</span> : null}
                    {item}
                  </span>
                ))}
              </div>

              {series.genres.length > 0 ? (
                <p className="mb-3 text-sm text-ink/45">
                  {series.genres.map(translateGenre).join(" · ")}
                </p>
              ) : null}

              {series.totalWatchedMinutes > 0 ? (
                <p className="mb-3 text-sm">
                  <span className="text-ink/45">İzlediğim: </span>
                  <span className="font-medium text-ink">
                    {watchedMinutesLabel(series.totalWatchedMinutes)}
                  </span>
                </p>
              ) : null}

              <div className="mb-3 max-w-md">
                <div className="mb-1 flex justify-between text-xs text-ink/45">
                  <span>
                    {series.watchedEpisodes} / {series.totalEpisodes} bölüm
                  </span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${width}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>

              {series.overview ? (
                <p className="text-sm leading-relaxed text-ink/60">
                  {series.overview}
                </p>
              ) : null}
            </div>
          </div>

          <h2 className="mb-4 font-editorial text-lg font-semibold text-ink">
            Sezonlar
          </h2>
          <SeasonAccordion
            seasons={series.seasons}
            seriesId={id}
            canEdit={canEdit}
          />
        </div>
      </main>
    </PageTransitionTarget>
  );
}
