/**
 * imdb_watchlist poster_url + episode_count — TMDB find(imdb_id)
 *
 * Kullanım: npm run fetch:series-posters
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DELAY_MS = 220;
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

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

type Row = {
  id: string;
  imdb_id: string | null;
  title: string;
  title_type: string | null;
  poster_url: string | null;
  episode_count: number | null;
};

type TmdbFind = {
  tv_results?: { id: number; poster_path: string | null }[];
  movie_results?: { id: number; poster_path: string | null }[];
  tv_episode_results?: { still_path?: string | null; show_id?: number }[];
};

type TmdbTv = {
  poster_path?: string | null;
  number_of_episodes?: number | null;
  episode_run_time?: number[] | null;
};

async function tmdbJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  return (await res.json()) as T;
}

async function main(): Promise<void> {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tmdb = process.env.TMDB_API_KEY;
  if (!url || !key || url.includes("YOUR_")) {
    console.error("❌ Supabase env eksik");
    process.exit(1);
  }
  if (!tmdb) {
    console.error("❌ TMDB_API_KEY eksik");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("imdb_watchlist")
    .select("id, imdb_id, title, title_type, poster_url, episode_count")
    .order("imdb_position", { ascending: true });

  if (error) {
    console.error("❌ Select:", error.message);
    process.exit(1);
  }

  const rows = (data ?? []) as Row[];
  const missing = rows.filter((r) => !r.poster_url || !r.episode_count);
  console.log(`📺 ${rows.length} kayıt, ${missing.length} afiş/bölüm eksiği`);

  let ok = 0;
  let fail = 0;

  for (const row of missing) {
    const imdbId = row.imdb_id?.trim();
    if (!imdbId) {
      fail++;
      console.log(`✗ ${row.title} — imdb_id yok`);
      continue;
    }

    const find = await tmdbJson<TmdbFind>(
      `https://api.themoviedb.org/3/find/${encodeURIComponent(imdbId)}?api_key=${tmdb}&external_source=imdb_id`
    );
    await sleep(DELAY_MS);

    const tv = find?.tv_results?.[0];
    const movie = find?.movie_results?.[0];
    let posterPath = tv?.poster_path ?? movie?.poster_path ?? null;
    let episodeCount = row.episode_count;

    if (tv?.id) {
      const detail = await tmdbJson<TmdbTv>(
        `https://api.themoviedb.org/3/tv/${tv.id}?api_key=${tmdb}`
      );
      await sleep(DELAY_MS);
      if (detail?.poster_path) posterPath = detail.poster_path;
      if (detail?.number_of_episodes) episodeCount = detail.number_of_episodes;
    }

    const posterUrl = posterPath ? `${TMDB_IMG}${posterPath}` : null;
    if (!posterUrl && !episodeCount) {
      fail++;
      console.log(`✗ ${row.title} — TMDB eşleşmedi`);
      continue;
    }

    const patch: { poster_url?: string; episode_count?: number } = {};
    if (posterUrl) patch.poster_url = posterUrl;
    if (episodeCount) patch.episode_count = episodeCount;

    const { error: upErr } = await supabase
      .from("imdb_watchlist")
      .update(patch)
      .eq("id", row.id);

    if (upErr) {
      fail++;
      console.log(`✗ ${row.title} — ${upErr.message}`);
    } else {
      ok++;
      console.log(
        `✓ ${row.title}${posterUrl ? " poster" : ""}${episodeCount ? ` ${episodeCount} bölüm` : ""}`
      );
    }
  }

  console.log(`\nBitti. ✓ ${ok}  ✗ ${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
