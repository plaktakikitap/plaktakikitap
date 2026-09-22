"use client";

import { useEffect, useState, useTransition } from "react";
import { toggleEpisode, toggleSeason } from "@/app/actions/series";
import type { SeriesSeasonItem } from "@/lib/series-progress";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function SeasonAccordion({
  seasons,
  seriesId,
  canEdit = false,
  variant = "public",
}: {
  seasons: SeriesSeasonItem[];
  seriesId: string;
  canEdit?: boolean;
  variant?: "public" | "admin";
}) {
  const admin = variant === "admin";
  const [openSeason, setOpenSeason] = useState<number | null>(
    seasons[0]?.seasonNumber ?? null
  );
  const [rows, setRows] = useState(seasons);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRows(seasons);
  }, [seasons]);

  if (rows.length === 0) {
    return (
      <p
        className={`py-10 text-center text-sm ${
          admin ? "text-white/40" : "text-ink/45"
        }`}
      >
        Sezon bilgisi henüz yok.
      </p>
    );
  }

  function markEpisode(seasonNumber: number, episodeId: string, watched: boolean) {
    if (!canEdit) return;
    setRows((prev) =>
      prev.map((s) =>
        s.seasonNumber !== seasonNumber
          ? s
          : {
              ...s,
              episodes: s.episodes.map((e) =>
                e.id === episodeId ? { ...e, watched } : e
              ),
            }
      )
    );
    startTransition(async () => {
      const res = await toggleEpisode(episodeId, watched);
      if (res && "error" in res) {
        setRows(seasons);
      }
    });
  }

  function markSeason(seasonNumber: number, watched: boolean) {
    if (!canEdit) return;
    setRows((prev) =>
      prev.map((s) =>
        s.seasonNumber !== seasonNumber
          ? s
          : {
              ...s,
              episodes: s.episodes.map((e) => ({ ...e, watched })),
            }
      )
    );
    startTransition(async () => {
      const res = await toggleSeason(seriesId, seasonNumber, watched);
      if (res && "error" in res) {
        setRows(seasons);
      }
    });
  }

  return (
    <div className={`space-y-2 ${isPending ? "opacity-80" : ""}`}>
      {rows.map((season) => {
        const episodes = [...season.episodes].sort(
          (a, b) => a.episodeNumber - b.episodeNumber
        );
        const watchedCount = episodes.filter((e) => e.watched).length;
        const allWatched =
          episodes.length > 0 && watchedCount === episodes.length;
        const isOpen = openSeason === season.seasonNumber;
        const label = season.name?.trim() || `Sezon ${season.seasonNumber}`;

        return (
          <div
            key={season.id}
            className={`overflow-hidden rounded-lg border ${
              admin ? "border-white/10" : "border-ink/10"
            }`}
          >
            <div
              className={`flex cursor-pointer items-center gap-3 p-4 transition-colors ${
                admin ? "hover:bg-white/5" : "hover:bg-ink/[0.04]"
              }`}
              onClick={() =>
                setOpenSeason(isOpen ? null : season.seasonNumber)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenSeason(isOpen ? null : season.seasonNumber);
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
            >
              {season.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={season.posterUrl}
                  alt=""
                  className="h-12 w-8 rounded object-cover"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${admin ? "text-white" : "text-ink"}`}>
                  {label}
                </p>
                <p className={`text-xs ${admin ? "text-white/45" : "text-ink/45"}`}>
                  {watchedCount}/{episodes.length} bölüm izlendi
                </p>
              </div>
              {canEdit ? (
                <button
                  type="button"
                  disabled={isPending || episodes.length === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    markSeason(season.seasonNumber, !allWatched);
                  }}
                  className={`rounded px-3 py-1 text-xs transition-colors disabled:opacity-50 ${
                    allWatched
                      ? "bg-[#3b82f6] text-white"
                      : admin
                        ? "bg-white/10 text-white/60 hover:bg-white/15"
                        : "bg-ink/5 text-ink/55 hover:bg-ink/10"
                  }`}
                >
                  {allWatched ? "✓ Tamamlandı" : "Tümünü İşaretle"}
                </button>
              ) : allWatched ? (
                <span className="rounded bg-[#3b82f6] px-3 py-1 text-xs text-white">
                  ✓ Tamamlandı
                </span>
              ) : null}
              <span
                className={admin ? "text-white/35" : "text-ink/35"}
                aria-hidden
              >
                {isOpen ? "▲" : "▼"}
              </span>
            </div>

            {isOpen ? (
              <div className={admin ? "border-t border-white/10" : "border-t border-ink/10"}>
                {episodes.length === 0 ? (
                  <p
                    className={`px-4 py-4 text-center text-xs ${
                      admin ? "text-white/40" : "text-ink/40"
                    }`}
                  >
                    Bölüm kaydı yok.
                  </p>
                ) : (
                  episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className={`flex items-center gap-3 px-4 py-2.5 last:border-0 ${
                        admin
                          ? `border-b border-white/[0.06] ${
                              episode.watched ? "bg-white/[0.04]" : ""
                            }`
                          : `border-b border-ink/[0.06] ${
                              episode.watched ? "bg-ink/[0.03]" : ""
                            }`
                      }`}
                    >
                      {canEdit ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            markEpisode(
                              season.seasonNumber,
                              episode.id,
                              !episode.watched
                            )
                          }
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                            episode.watched
                              ? "border-[#3b82f6] bg-[#3b82f6] text-white"
                              : admin
                                ? "border-white/25 hover:border-[#3b82f6]/70"
                                : "border-ink/20 hover:border-[#3b82f6]/70"
                          }`}
                          aria-label={
                            episode.watched
                              ? "İzlendi olarak işaretli, kaldırmak için tıkla"
                              : "İzlenmedi, işaretlemek için tıkla"
                          }
                          aria-pressed={episode.watched}
                        >
                          {episode.watched ? (
                            <span className="text-xs">✓</span>
                          ) : null}
                        </button>
                      ) : (
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                            episode.watched
                              ? "border-[#3b82f6] bg-[#3b82f6] text-white"
                              : admin
                                ? "border-white/20"
                                : "border-ink/15"
                          }`}
                          aria-label={
                            episode.watched ? "İzlenmiş" : "İzlenmedi"
                          }
                        >
                          {episode.watched ? (
                            <span className="text-xs">✓</span>
                          ) : null}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${
                            episode.watched
                              ? admin
                                ? "text-white/40 line-through"
                                : "text-ink/45 line-through"
                              : admin
                                ? "text-white"
                                : "text-ink"
                          }`}
                        >
                          <span
                            className={`mr-1 ${
                              admin ? "text-white/35" : "text-ink/40"
                            }`}
                          >
                            S{pad(episode.seasonNumber)}B
                            {pad(episode.episodeNumber)}
                          </span>
                          {episode.name || `Bölüm ${episode.episodeNumber}`}
                        </p>
                      </div>
                      {episode.runtime ? (
                        <span
                          className={`shrink-0 text-xs ${
                            admin ? "text-white/40" : "text-ink/40"
                          }`}
                        >
                          {episode.runtime} dk
                        </span>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default SeasonAccordion;
export { SeasonAccordion };
