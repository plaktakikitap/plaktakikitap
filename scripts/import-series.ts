/**
 * scripts/output/imdb-watchlist.csv → imdb_watchlist tablosu
 *
 * Kullanım: npm run import:series
 *
 * Gereken env (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Not: public.series izleme günlüğü tablosudur (content_id PK).
 * IMDb listesi oraya yazılmaz.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { parse } from "csv-parse/sync";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv(): void {
  const projectRoot = path.resolve(__dirname, "..");
  const envLocal = path.join(projectRoot, ".env.local");
  if (fs.existsSync(envLocal)) {
    config({ path: envLocal });
  } else {
    config({ path: path.join(projectRoot, ".env") });
  }
}

type CsvRow = Record<string, string>;

function cell(row: CsvRow, ...keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return "";
}

function parseIntOrNull(raw: string): number | null {
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function parseFloatOrNull(raw: string): number | null {
  if (!raw) return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function parseDateOrNull(raw: string): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

async function importSeries() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("YOUR_") || key.includes("YOUR_")) {
    console.error(
      "❌ .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı."
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const csvPath = path.join(process.cwd(), "scripts", "output", "imdb-watchlist.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("❌ imdb-watchlist.csv bulunamadı:", csvPath);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
    relax_column_count: true,
  }) as CsvRow[];

  console.log(`📺 ${rows.length} kayıt yüklendi`);

  const { data: existing, error: fetchErr } = await supabase
    .from("imdb_watchlist")
    .select("imdb_id");

  if (fetchErr) {
    console.error("❌ Mevcut kayıtlar okunamadı:", fetchErr.message);
    process.exit(1);
  }

  const existingIds = new Set(
    (existing || [])
      .map((r: { imdb_id?: string | null }) => r.imdb_id)
      .filter((id): id is string => Boolean(id))
  );
  console.log(`📊 Zaten ${existingIds.size} IMDb kaydı mevcut`);

  const toInsert = rows
    .map((r) => {
      const imdbId = cell(r, "Const") || null;
      const title = cell(r, "Title", "Original Title");
      const genresRaw = cell(r, "Genres");
      return {
        imdb_id: imdbId,
        title,
        original_title: cell(r, "Original Title") || null,
        imdb_url: cell(r, "URL") || null,
        title_type: cell(r, "Title Type") || null,
        imdb_rating: parseFloatOrNull(cell(r, "IMDb Rating")),
        runtime_mins: parseIntOrNull(cell(r, "Runtime (mins)")),
        year: parseIntOrNull(cell(r, "Year")),
        genres: genresRaw
          ? genresRaw.split(",").map((g) => g.trim()).filter(Boolean)
          : null,
        release_date: cell(r, "Release Date") || null,
        user_rating: parseIntOrNull(cell(r, "Your Rating")),
        date_rated: parseDateOrNull(cell(r, "Date Rated")),
        imdb_position: parseIntOrNull(cell(r, "Position")),
      };
    })
    .filter((r) => r.title && (!r.imdb_id || !existingIds.has(r.imdb_id)));

  console.log(`➕ ${toInsert.length} yeni kayıt eklenecek`);

  if (toInsert.length === 0) {
    console.log("✅ Eklenecek yeni kayıt yok");
    return;
  }

  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize);
    const { error } = await supabase.from("imdb_watchlist").insert(batch);

    if (error) {
      console.error(`❌ Batch ${i}-${i + batch.length} hatası:`, error.message);
      console.error("İlk kayıt:", JSON.stringify(batch[0], null, 2));
    } else {
      inserted += batch.length;
      console.log(`✅ ${inserted}/${toInsert.length} kayıt eklendi`);
    }
  }

  console.log(`\n🎉 Tamamlandı! ${inserted} kayıt eklendi.`);

  const types = rows.reduce<Record<string, number>>((acc, r) => {
    const t = cell(r, "Title Type") || "(boş)";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  console.log("Tür dağılımı:", types);
}

importSeries().catch((err) => {
  console.error(err);
  process.exit(1);
});
