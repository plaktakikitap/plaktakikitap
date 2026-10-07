"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import {
  getAdminSeriesSeasons,
  rewatchEpisodes,
  rewatchSeason,
  saveEpisodeReview,
  saveSeriesReview,
} from "@/app/actions/series";
import type { SeriesEpisodeItem, SeriesSeasonItem } from "@/lib/series-progress";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function timesLabel(episode: SeriesEpisodeItem) {
  const extra = episode.watchCount ?? 0;
  const total = (episode.watched ? 1 : 0) + extra;
  if (total <= 1) return null;
  return `${total} kez`;
}

export function AdminSeriesWatchJournal({
  seriesId,
  initialReview,
  onReviewSaved,
}: {
  seriesId: string;
  initialReview: string;
  onReviewSaved: (review: string | null) => void;
}) {
  const [review, setReview] = useState(initialReview);
  const [savingReview, setSavingReview] = useState(false);
  const [reviewNote, setReviewNote] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<SeriesSeasonItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openSeason, setOpenSeason] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [commentId, setCommentId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await getAdminSeriesSeasons(seriesId);
      if (cancelled) return;
      if (res && "error" in res && res.error) {
        setLoadError(res.error);
        setSeasons([]);
        return;
      }
      if (res && "seasons" in res) setSeasons(res.seasons);
    })();
    return () => {
      cancelled = true;
    };
  }, [seriesId]);

  function patchEpisodes(
    match: (episode: SeriesEpisodeItem) => boolean,
    patch: (episode: SeriesEpisodeItem) => SeriesEpisodeItem
  ) {
    setSeasons((prev) =>
      (prev ?? []).map((season) => ({
        ...season,
        episodes: season.episodes.map((episode) =>
          match(episode) ? patch(episode) : episode
        ),
      }))
    );
  }

  async function saveShowReview() {
    setSavingReview(true);
    setReviewNote(null);
    const res = await saveSeriesReview(seriesId, review);
    setSavingReview(false);
    if (res && "error" in res && res.error) {
      setReviewNote(res.error);
      return;
    }
    if (res && "review" in res) {
      onReviewSaved(res.review);
      setReviewNote("Yorum kaydedildi");
    }
  }

  async function markSeason(seasonNumber: number) {
    setBusy(`season-${seasonNumber}`);
    setActionError(null);
    const res = await rewatchSeason(seriesId, seasonNumber);
    setBusy(null);
    if (res && "error" in res && res.error) {
      setActionError(res.error);
      return;
    }
    if (res && "episodes" in res) {
      const byId = new Map(res.episodes.map((episode) => [episode.id, episode.watchCount]));
      patchEpisodes(
        (episode) => byId.has(episode.id),
        (episode) => ({
          ...episode,
          watched: true,
          watchCount: byId.get(episode.id) ?? episode.watchCount,
        })
      );
    }
  }

  async function markSelected(season: SeriesSeasonItem) {
    const ids = season.episodes
      .map((episode) => episode.id)
      .filter((id) => selected.has(id));
    if (ids.length === 0) return;
    setBusy(`pick-${season.seasonNumber}`);
    setActionError(null);
    const res = await rewatchEpisodes(seriesId, ids);
    setBusy(null);
    if (res && "error" in res && res.error) {
      setActionError(res.error);
      return;
    }
    if (res && "episodes" in res) {
      const byId = new Map(res.episodes.map((episode) => [episode.id, episode.watchCount]));
      patchEpisodes(
        (episode) => byId.has(episode.id),
        (episode) => ({
          ...episode,
          watched: true,
          watchCount: byId.get(episode.id) ?? episode.watchCount,
        })
      );
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.delete(id);
        return next;
      });
    }
  }

  async function markOne(episodeId: string) {
    setBusy(episodeId);
    setActionError(null);
    const res = await rewatchEpisodes(seriesId, [episodeId]);
    setBusy(null);
    if (res && "error" in res && res.error) {
      setActionError(res.error);
      return;
    }
    const next = res && "episodes" in res ? res.episodes[0] : null;
    if (!next) return;
    patchEpisodes(
      (episode) => episode.id === episodeId,
      (episode) => ({ ...episode, watched: true, watchCount: next.watchCount })
    );
  }

  async function saveComment(episode: SeriesEpisodeItem) {
    const text = drafts[episode.id] ?? episode.review ?? "";
    setBusy(`comment-${episode.id}`);
    setActionError(null);
    const res = await saveEpisodeReview(episode.id, text);
    setBusy(null);
    if (res && "error" in res && res.error) {
      setActionError(res.error);
      return;
    }
    if (res && "review" in res) {
      patchEpisodes(
        (item) => item.id === episode.id,
        (item) => ({ ...item, review: res.review })
      );
      setCommentId(null);
    }
  }

  const selectedIn = (season: SeriesSeasonItem) =>
    season.episodes.filter((episode) => selected.has(episode.id)).length;

  return (
    <div className="mt-3 space-y-4 rounded-xl border border-[#e8e0d4] bg-[#faf7f2] p-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-[#6b6158]">
          Dizi yorumu
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          placeholder="Dizinin tamamı hakkında…"
          className="w-full resize-y rounded-xl border border-[#e8e0d4] bg-white px-3 py-2 text-sm text-[#1a1612] outline-none focus:border-[#b8934a]/40"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void saveShowReview()}
            disabled={savingReview}
            className="rounded-lg bg-[#1a1612] px-3 py-1.5 text-xs font-medium text-[#faf7f2] disabled:opacity-50"
          >
            {savingReview ? "Kaydediliyor…" : "Yorumu kaydet"}
          </button>
          {reviewNote ? (
            <span className="text-xs text-[#6b6158]">{reviewNote}</span>
          ) : null}
        </div>
      </div>

      {actionError ? <p className="text-xs text-red-600">{actionError}</p> : null}
      {loadError ? <p className="text-xs text-red-600">{loadError}</p> : null}
      {seasons == null ? (
        <p className="flex items-center gap-2 py-4 text-xs text-[#6b6158]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Bölümler yükleniyor…
        </p>
      ) : seasons.length === 0 ? (
        <p className="py-3 text-center text-xs text-[#a09588]">
          Bu dizide sezon veya bölüm kaydı yok.
        </p>
      ) : (
        <div className="space-y-2">
          {seasons.map((season) => {
            const open = openSeason === season.seasonNumber;
            const picked = selectedIn(season);
            const label = season.name?.trim() || `Sezon ${season.seasonNumber}`;
            const watched = season.episodes.filter((episode) => episode.watched).length;
            return (
              <div
                key={season.id}
                className="overflow-hidden rounded-xl border border-[#e8e0d4] bg-white"
              >
                <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSeason(open ? null : season.seasonNumber)
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-sm font-medium text-[#1a1612]">{label}</p>
                    <p className="text-xs text-[#6b6158]">
                      {watched}/{season.episodes.length} bölüm izlendi
                    </p>
                  </button>
                  <button
                    type="button"
                    disabled={busy != null || season.episodes.length === 0}
                    onClick={() => void markSeason(season.seasonNumber)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#e8e0d4] px-2 py-1 text-xs font-medium text-[#1a1612] hover:border-[#b8934a]/40 hover:text-[#b8934a] disabled:opacity-50"
                  >
                    {busy === `season-${season.seasonNumber}` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Sezonu tekrar izledim
                  </button>
                </div>
                {open ? (
                  <div className="border-t border-[#e8e0d4]">
                    {picked > 0 ? (
                      <div className="flex items-center justify-between gap-2 bg-[#b8934a]/10 px-3 py-2">
                        <span className="text-xs text-[#1a1612]">
                          {picked} bölüm seçili
                        </span>
                        <button
                          type="button"
                          disabled={busy != null}
                          onClick={() => void markSelected(season)}
                          className="rounded-lg bg-[#1a1612] px-2.5 py-1 text-xs font-medium text-[#faf7f2] disabled:opacity-50"
                        >
                          {busy === `pick-${season.seasonNumber}`
                            ? "Kaydediliyor…"
                            : "Seçilenleri tekrar izledim"}
                        </button>
                      </div>
                    ) : null}
                    <ul className="max-h-96 divide-y divide-[#f0ebe2] overflow-y-auto">
                      {season.episodes
                        .slice()
                        .sort((a, b) => a.episodeNumber - b.episodeNumber)
                        .map((episode) => {
                          const times = timesLabel(episode);
                          const commenting = commentId === episode.id;
                          return (
                            <li key={episode.id} className="px-3 py-2">
                              <div className="flex items-start gap-2">
                                <input
                                  type="checkbox"
                                  checked={selected.has(episode.id)}
                                  onChange={(e) => {
                                    setSelected((prev) => {
                                      const next = new Set(prev);
                                      if (e.target.checked) next.add(episode.id);
                                      else next.delete(episode.id);
                                      return next;
                                    });
                                  }}
                                  aria-label={`${label} bölüm ${episode.episodeNumber} seç`}
                                  className="mt-1 accent-[#b8934a]"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-[#1a1612]">
                                    <span className="mr-1 text-xs text-[#a09588]">
                                      S{pad(episode.seasonNumber)}B
                                      {pad(episode.episodeNumber)}
                                    </span>
                                    {episode.name || `Bölüm ${episode.episodeNumber}`}
                                  </p>
                                  <p className="text-xs text-[#6b6158]">
                                    {episode.watched ? "İzlendi" : "İzlenmedi"}
                                    {times ? ` · ${times}` : ""}
                                    {episode.review ? " · yorum var" : ""}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  disabled={busy != null}
                                  onClick={() => void markOne(episode.id)}
                                  className="shrink-0 rounded-lg border border-[#e8e0d4] px-2 py-1 text-xs text-[#1a1612] hover:border-[#b8934a]/40 hover:text-[#b8934a] disabled:opacity-50"
                                >
                                  {busy === episode.id ? "…" : "Tekrar izledim"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCommentId(commenting ? null : episode.id);
                                    setDrafts((prev) =>
                                      prev[episode.id] != null
                                        ? prev
                                        : {
                                            ...prev,
                                            [episode.id]: episode.review ?? "",
                                          }
                                    );
                                  }}
                                  className="shrink-0 rounded-lg px-2 py-1 text-xs text-[#b8934a]"
                                >
                                  Yorum
                                </button>
                              </div>
                              {commenting ? (
                                <div className="mt-2 pl-6">
                                  <textarea
                                    value={drafts[episode.id] ?? ""}
                                    onChange={(e) =>
                                      setDrafts((prev) => ({
                                        ...prev,
                                        [episode.id]: e.target.value,
                                      }))
                                    }
                                    rows={2}
                                    placeholder="Bu bölüm hakkında…"
                                    className="w-full resize-y rounded-lg border border-[#e8e0d4] px-2 py-1.5 text-xs outline-none focus:border-[#b8934a]/40"
                                  />
                                  <button
                                    type="button"
                                    disabled={busy != null}
                                    onClick={() => void saveComment(episode)}
                                    className="mt-1 rounded-lg bg-[#1a1612] px-2.5 py-1 text-xs text-[#faf7f2] disabled:opacity-50"
                                  >
                                    {busy === `comment-${episode.id}`
                                      ? "Kaydediliyor…"
                                      : "Yorumu kaydet"}
                                  </button>
                                </div>
                              ) : episode.review ? (
                                <p className="mt-1 whitespace-pre-wrap pl-6 text-xs text-[#6b6158]">
                                  {episode.review}
                                </p>
                              ) : null}
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
