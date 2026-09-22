/**
 * IMDb watchlist → series (content_id) + TMDB sezon/bölüm zenginleştirme
 *
 * Kullanım: npm run enrich:series
 *
 * Kesintisiz çalışır: tek dizi / 429 hatası tüm koşuyu durdurmaz.
 * TMDB ücretsiz plan ~50 istek/sn; DELAY=300ms (~3 istek/sn) bunu karşılar.
 *
 * series PK = content_id. TMDB yayın durumu tmdb_status'a yazılır
 * (series.status = finished/waiting/dropped, karışmaz).
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p";
const DELAY = 300; // ms — TMDB free 50 req/s; 300ms yeter, ekstra yavaşlatma yok

function loadEnv(): void {
  const projectRoot = path.resolve(__dirname, "..");
  const envLocal = path.join(projectRoot, ".env.local");
  if (fs.existsSync(envLocal)) {
    config({ path: envLocal });
  } else {
    config({ path: path.join(projectRoot, ".env") });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type ImdbRow = {
  imdb_id: string | null;
  title: string;
  original_title: string | null;
  year: number | null;
  genres: string[] | null;
};

type SeriesRow = {
  content_id: string;
  imdb_id: string | null;
  tmdb_id: number | null;
};

type TmdbFind = {
  tv_results?: { id: number }[];
};

type TmdbSeasonInfo = {
  season_number: number;
  name?: string | null;
  poster_path?: string | null;
  overview?: string | null;
  air_date?: string | null;
  episode_count?: number | null;
};

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

  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const res = await fetch(url.toString());
      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : DELAY * attempt;
        console.warn(`  TMDB ${res.status}, ${wait}ms sonra tekrar…`);
        await sleep(wait);
        continue;
      }
      await sleep(DELAY);
      if (!res.ok) return null;
      return res.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`  TMDB ağ hatası (${attempt}/8): ${message}`);
      await sleep(DELAY * attempt);
    }
  }
  return null;
}

async function findTmdbId(apiKey: string, imdbId: string): Promise<number | null> {
  const data = (await tmdbFetch(apiKey, `/find/${imdbId}`, {
    external_source: "imdb_id",
  })) as TmdbFind | null;
  return data?.tv_results?.[0]?.id ?? null;
}

async function ensureSeriesRow(
  supabase: SupabaseClient,
  imdb: ImdbRow
): Promise<SeriesRow | null> {
  const imdbId = imdb.imdb_id?.trim();
  if (!imdbId) return null;

  const { data: existing } = await supabase
    .from("series")
    .select("content_id, imdb_id, tmdb_id")
    .eq("imdb_id", imdbId)
    .maybeSingle();

  if (existing) return existing as SeriesRow;

  const slug = `${slugify(imdb.title) || "dizi"}-${imdbId.replace(/^tt/, "")}`;
  const { data: content, error: cErr } = await supabase
    .from("content_items")
    .insert({
      type: "series",
      title: imdb.title,
      slug,
      visibility: "public",
    })
    .select("id")
    .single();

  if (cErr || !content) {
    console.error(`❌ content_items: ${imdb.title} — ${cErr?.message}`);
    return null;
  }

  const { error: sErr } = await supabase.from("series").insert({
    content_id: content.id,
    imdb_id: imdbId,
    watch_status: "watchlist",
    year: imdb.year,
    genre_tags: imdb.genres,
    episodes_watched: 0,
    seasons_watched: 0,
  });

  if (sErr) {
    console.error(`❌ series insert: ${imdb.title} — ${sErr.message}`);
    return null;
  }

  return { content_id: content.id, imdb_id: imdbId, tmdb_id: null };
}

async function enrichOne(
  supabase: SupabaseClient,
  apiKey: string,
  series: SeriesRow,
  title: string
): Promise<boolean> {
  const imdbId = series.imdb_id?.trim();
  if (!imdbId) return false;

  const tmdbId = series.tmdb_id ?? (await findTmdbId(apiKey, imdbId));
  if (!tmdbId) {
    console.log(`⚠️  TMDB bulunamadı: ${title}`);
    return false;
  }

  const detail = (await tmdbFetch(apiKey, `/tv/${tmdbId}`)) as TmdbTv | null;
  if (!detail) return false;

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
    .eq("content_id", series.content_id);

  if (upErr) {
    console.error(`❌ series update: ${title} — ${upErr.message}`);
    return false;
  }

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
          series_id: series.content_id,
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

    if (seasonErr || !seasonRow) {
      console.error(
        `  sezon ${seasonInfo.season_number}: ${seasonErr?.message ?? "upsert yok"}`
      );
      continue;
    }

    const episodes = (seasonData.episodes ?? []).map((ep) => ({
      series_id: series.content_id,
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
      const { error: epErr } = await supabase
        .from("series_episodes")
        .upsert(episodes, {
          onConflict: "series_id,season_number,episode_number",
        });
      if (epErr) {
        console.error(`  bölümler S${seasonInfo.season_number}: ${epErr.message}`);
      }
    }
  }

  console.log(
    `✅ ${title} (${detail.number_of_seasons ?? "?"} sezon, ${detail.number_of_episodes ?? "?"} bölüm)`
  );
  return true;
}

async function enrichSeries(): Promise<void> {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.TMDB_API_KEY;
  if (!url || !key || url.includes("YOUR_")) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY eksik");
    process.exit(1);
  }
  if (!apiKey) {
    console.error("❌ TMDB_API_KEY eksik");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: watchlist, error: wErr } = await supabase
    .from("imdb_watchlist")
    .select("imdb_id, title, original_title, year, genres")
    .not("imdb_id", "is", null)
    .order("imdb_position", { ascending: true });

  if (wErr) {
    console.error("❌ imdb_watchlist:", wErr.message);
    process.exit(1);
  }

  const list = (watchlist ?? []) as ImdbRow[];
  if (list.length === 0) {
    console.log("Zenginleştirilecek dizi yok (imdb_watchlist boş).");
    return;
  }

  console.log(`🔍 ${list.length} IMDb kaydı taranıyor`);
  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const imdb of list) {
    const row = await ensureSeriesRow(supabase, imdb);
    if (!row) {
      failed++;
      continue;
    }

    if (row.tmdb_id) {
      skipped++;
      continue;
    }

    try {
      const ok = await enrichOne(supabase, apiKey, row, imdb.title);
      if (ok) success++;
      else failed++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌ Hata: ${imdb.title} —`, message);
      failed++;
      await sleep(DELAY);
    }
  }

  console.log(
    `\n🎉 Tamamlandı: ${success} zenginleştirildi, ${skipped} zaten vardı, ${failed} başarısız`
  );
}

enrichSeries().catch((err) => {
  console.error(err);
  process.exit(1);
});
