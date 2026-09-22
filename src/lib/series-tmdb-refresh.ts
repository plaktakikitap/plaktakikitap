import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p";
const DELAY = 300;

type TmdbFind = { tv_results?: { id: number }[] };
type TmdbSeasonInfo = { season_number: number };
type TmdbEpisode = {
  episode_number: number;
  name?: string | null;
  overview?: string | null;
  runtime?: number | null;
  air_date?: string | null;
  still_path?: string | null;
};
type TmdbTv = {
  id: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string | null;
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  episode_run_time?: number[] | null;
  status?: string | null;
  last_air_date?: string | null;
  origin_country?: string[] | null;
  seasons?: TmdbSeasonInfo[];
};
type TmdbSeasonDetail = {
  name?: string | null;
  air_date?: string | null;
  poster_path?: string | null;
  overview?: string | null;
  episodes?: TmdbEpisode[];
};

async function tmdbFetch(
  apiKey: string,
  path: string,
  extra: Record<string, string> = {}
): Promise<unknown | null> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "tr-TR");
  for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        await sleep(DELAY * attempt);
        continue;
      }
      await sleep(DELAY);
      if (!res.ok) return null;
      return res.json();
    } catch {
      await sleep(DELAY * attempt);
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function refreshSeriesFromTmdb(input: {
  supabase: SupabaseClient;
  apiKey: string;
  contentId: string;
}): Promise<{ ok: true } | { error: string }> {
  const { supabase, apiKey, contentId } = input;

  const { data: series, error: seriesErr } = await supabase
    .from("series")
    .select("content_id, imdb_id, tmdb_id")
    .eq("content_id", contentId)
    .maybeSingle();

  if (seriesErr || !series) return { error: "Dizi bulunamadı" };

  let tmdbId = (series as { tmdb_id?: number | null }).tmdb_id ?? null;
  const imdbId = (series as { imdb_id?: string | null }).imdb_id?.trim();

  if (!tmdbId && imdbId) {
    const found = (await tmdbFetch(apiKey, `/find/${imdbId}`, {
      external_source: "imdb_id",
    })) as TmdbFind | null;
    tmdbId = found?.tv_results?.[0]?.id ?? null;
  }

  if (!tmdbId) return { error: "TMDB kaydı bulunamadı" };

  const detail = (await tmdbFetch(apiKey, `/tv/${tmdbId}`)) as TmdbTv | null;
  if (!detail) return { error: "TMDB detay alınamadı" };

  const runtime = detail.episode_run_time?.[0] ?? null;
  const { error: upErr } = await supabase
    .from("series")
    .update({
      tmdb_id: tmdbId,
      poster_url: detail.poster_path
        ? `${TMDB_IMG}/w500${detail.poster_path}`
        : null,
      backdrop_url: detail.backdrop_path
        ? `${TMDB_IMG}/w1280${detail.backdrop_path}`
        : null,
      overview: detail.overview || null,
      total_seasons: detail.number_of_seasons || 0,
      total_episodes: detail.number_of_episodes || 0,
      episode_runtime: runtime,
      avg_episode_min: runtime,
      tmdb_status: detail.status || null,
      last_air_date: detail.last_air_date || null,
      origin_country: detail.origin_country?.length ? detail.origin_country : [],
    })
    .eq("content_id", contentId);

  if (upErr) return { error: upErr.message };

  for (const seasonInfo of detail.seasons ?? []) {
    if (seasonInfo.season_number === 0) continue;
    const seasonData = (await tmdbFetch(
      apiKey,
      `/tv/${tmdbId}/season/${seasonInfo.season_number}`
    )) as TmdbSeasonDetail | null;
    if (!seasonData) continue;

    const { data: seasonRow, error: seasonErr } = await supabase
      .from("series_seasons")
      .upsert(
        {
          series_id: contentId,
          season_number: seasonInfo.season_number,
          name: seasonData.name || `Sezon ${seasonInfo.season_number}`,
          episode_count: seasonData.episodes?.length || 0,
          air_date: seasonData.air_date || null,
          poster_url: seasonData.poster_path
            ? `${TMDB_IMG}/w342${seasonData.poster_path}`
            : null,
          overview: seasonData.overview || null,
        },
        { onConflict: "series_id,season_number" }
      )
      .select("id")
      .single();

    if (seasonErr || !seasonRow) continue;

    const episodes = (seasonData.episodes ?? []).map((ep) => ({
      series_id: contentId,
      season_id: seasonRow.id as string,
      season_number: seasonInfo.season_number,
      episode_number: ep.episode_number,
      name: ep.name || null,
      overview: ep.overview || null,
      runtime: ep.runtime || runtime || null,
      air_date: ep.air_date || null,
      still_url: ep.still_path ? `${TMDB_IMG}/w300${ep.still_path}` : null,
    }));

    if (episodes.length > 0) {
      await supabase.from("series_episodes").upsert(episodes, {
        onConflict: "series_id,season_number,episode_number",
      });
    }
  }

  return { ok: true };
}
