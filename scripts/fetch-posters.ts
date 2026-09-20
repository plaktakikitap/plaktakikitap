/**
 * films.poster_url boş olan kayıtlar için TMDB'den afiş çeker ve günceller.
 *
 * Kullanım:
 *   npx tsx scripts/fetch-posters.ts
 *   # veya: npx ts-node --esm scripts/fetch-posters.ts
 *
 * Gereken env (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   TMDB_API_KEY
 */

import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");
const NO_POSTER_PATH = path.join(OUTPUT_DIR, "no-poster.json");
const DELAY_MS = 250;
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const PAGE_SIZE = 1000;

type FilmRow = {
  id: string;
  year: number | null;
  content_items: { title: string | null } | { title: string | null }[] | null;
};

type NoPosterEntry = {
  id: string;
  title: string;
  year: number | null;
  reason: string;
};

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

function filmTitle(row: FilmRow): string {
  const ci = row.content_items;
  if (Array.isArray(ci)) return (ci[0]?.title ?? "").trim();
  return (ci?.title ?? "").trim();
}

async function searchTmdbPoster(
  apiKey: string,
  title: string,
  year: number | null
): Promise<{ posterUrl: string | null; reason?: string }> {
  const params = new URLSearchParams({
    query: title,
    api_key: apiKey,
    include_adult: "false",
  });
  if (year != null && Number.isFinite(year)) {
    params.set("year", String(year));
  }

  const url = `https://api.themoviedb.org/3/search/movie?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    return { posterUrl: null, reason: `TMDB HTTP ${res.status}` };
  }

  const json = (await res.json()) as {
    results?: { poster_path?: string | null }[];
  };
  const first = json.results?.[0];
  if (!first) {
    return { posterUrl: null, reason: "no_results" };
  }
  if (!first.poster_path) {
    return { posterUrl: null, reason: "poster_path_null" };
  }
  return { posterUrl: `${TMDB_IMG}${first.poster_path}` };
}

async function fetchAllMissingPosters(
  supabase: ReturnType<typeof createClient>
): Promise<FilmRow[]> {
  const all: FilmRow[] = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("films")
      .select("id, year, content_items(title)")
      .is("poster_url", null)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Supabase select: ${error.message}`);
    }

    const batch = (data ?? []) as FilmRow[];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

async function main(): Promise<void> {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tmdbKey = process.env.TMDB_API_KEY;

  if (!url || !serviceKey || url.includes("YOUR_") || serviceKey.includes("YOUR_")) {
    console.error(
      "Hata: .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı."
    );
    process.exit(1);
  }
  if (!tmdbKey || tmdbKey === "YOUR_TMDB_API_KEY") {
    console.error(
      "Hata: .env.local içinde TMDB_API_KEY tanımlı olmalı (themoviedb.org/settings/api)."
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  console.log("poster_url boş filmler çekiliyor…");
  const films = await fetchAllMissingPosters(supabase);
  console.log(`Toplam: ${films.length} film\n`);

  if (films.length === 0) {
    console.log("Güncellenecek kayıt yok.");
    return;
  }

  const noPoster: NoPosterEntry[] = [];
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < films.length; i++) {
    const film = films[i]!;
    const title = filmTitle(film) || "(başlıksız)";
    const year = film.year;

    if (!filmTitle(film)) {
      console.log(`✗ ${title}`);
      noPoster.push({
        id: film.id,
        title,
        year,
        reason: "missing_title",
      });
      fail += 1;
      await sleep(DELAY_MS);
      continue;
    }

    try {
      const { posterUrl, reason } = await searchTmdbPoster(tmdbKey, title, year);
      if (!posterUrl) {
        console.log(`✗ ${title}`);
        noPoster.push({
          id: film.id,
          title,
          year,
          reason: reason ?? "unknown",
        });
        fail += 1;
      } else {
        const { error: updErr } = await supabase
          .from("films")
          .update({ poster_url: posterUrl })
          .eq("id", film.id);

        if (updErr) {
          console.log(`✗ ${title}`);
          noPoster.push({
            id: film.id,
            title,
            year,
            reason: `update: ${updErr.message}`,
          });
          fail += 1;
        } else {
          console.log(`✓ ${title}`);
          ok += 1;
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`✗ ${title}`);
      noPoster.push({ id: film.id, title, year, reason: msg });
      fail += 1;
    }

    if (i < films.length - 1) await sleep(DELAY_MS);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  fs.writeFileSync(NO_POSTER_PATH, JSON.stringify(noPoster, null, 2), "utf-8");

  console.log(`\nBitti. ✓ ${ok}  ✗ ${fail}`);
  console.log(`Eşleşmeyenler: ${NO_POSTER_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
