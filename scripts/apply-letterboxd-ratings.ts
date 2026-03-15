/**
 * ratings.csv'deki puanları veritabanındaki filmlere uygular.
 * Eşleşme: title + year ile. Puansız filmler olduğu gibi kalır.
 *
 * Kullanım: npx tsx scripts/apply-letterboxd-ratings.ts "path/to/letterboxd-export-folder"
 *   npm run apply:letterboxd-ratings -- "path/to/letterboxd-export-folder"
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === ",") {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    if (c === "\\" && line[i + 1] === '"') {
      cur += '"';
      i++;
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function csvToRows(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]!);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]!);
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = values[j] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

function get(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k]?.trim();
    if (v) return v;
  }
  return "";
}

function parseRating(val: string): number | null {
  const n = parseFloat(val);
  if (Number.isNaN(n)) return null;
  if (n >= 1 && n <= 10) return Math.round((n / 10) * 5 * 2) / 2;
  if (n >= 0 && n <= 5) return Math.round(n * 2) / 2;
  return null;
}

function loadEnv(): void {
  const projectRoot = path.resolve(__dirname, "..");
  const envLocal = path.join(projectRoot, ".env.local");
  if (fs.existsSync(envLocal)) {
    config({ path: envLocal });
  } else {
    config({ path: path.join(projectRoot, ".env") });
  }
}

async function main(): Promise<void> {
  const folderArg = process.argv[2];
  if (!folderArg || !fs.existsSync(folderArg)) {
    console.error("Kullanım: npx tsx scripts/apply-letterboxd-ratings.ts <letterboxd-export-klasörü>");
    process.exit(1);
  }

  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || url === "YOUR_SUPABASE_URL" || serviceKey === "YOUR_SERVICE_ROLE_KEY") {
    console.error("Hata: .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.");
    process.exit(1);
  }

  const ratingsPath = path.join(path.resolve(folderArg), "ratings.csv");
  if (!fs.existsSync(ratingsPath)) {
    console.error("ratings.csv bulunamadı:", ratingsPath);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(ratingsPath, "utf-8");
  const rows = csvToRows(csvContent);

  const ratings: { title: string; year: number | null; rating_5: number }[] = [];
  for (const row of rows) {
    const title = get(row, "Name", "Film Title", "Title");
    if (!title) continue;
    const yearRaw = get(row, "Year", "Release Year");
    const year = yearRaw ? parseInt(yearRaw, 10) : null;
    const r = parseRating(get(row, "Rating"));
    if (r == null) continue;
    ratings.push({ title, year: Number.isNaN(year!) ? null : year, rating_5: r });
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: contentList } = await supabase
    .from("content_items")
    .select("id, title")
    .eq("type", "film");
  const { data: filmsList } = await supabase.from("films").select("id, content_id, year");
  const yearByContentId = new Map<string, number | null>();
  for (const f of filmsList ?? []) {
    if (!yearByContentId.has(f.content_id)) yearByContentId.set(f.content_id, f.year ?? null);
  }
  const contentByKey = new Map<string, string>();
  for (const c of contentList ?? []) {
    const y = yearByContentId.get(c.id) ?? null;
    const k = `${(c.title ?? "").trim().toLowerCase()}|${y ?? ""}`;
    contentByKey.set(k, c.id);
  }

  function key(title: string, year: number | null): string {
    return `${(title ?? "").trim().toLowerCase()}|${year ?? ""}`;
  }

  let updated = 0;
  const errors: string[] = [];

  for (const r of ratings) {
    const contentId = contentByKey.get(key(r.title, r.year));
    if (!contentId) continue;

    const filmsForContent = (filmsList ?? []).filter((f) => f.content_id === contentId);
    for (const film of filmsForContent) {
      const { error } = await supabase
        .from("films")
        .update({ rating_5: r.rating_5 })
        .eq("id", film.id);
      if (error) {
        errors.push(`${r.title} (${r.year}): ${error.message}`);
      } else {
        updated += 1;
      }
    }

    const { error: contentErr } = await supabase
      .from("content_items")
      .update({ rating: r.rating_5 * 2 })
      .eq("id", contentId);
    if (contentErr) {
      errors.push(`content ${r.title}: ${contentErr.message}`);
    }
  }

  console.log("--- Puan güncelleme özeti ---");
  console.log(`ratings.csv satırı: ${ratings.length}`);
  console.log(`Güncellenen film puanı: ${updated}`);
  if (errors.length > 0) {
    console.log("Hatalar:", errors.slice(0, 5).join("; "));
    if (errors.length > 5) console.log(`  ... ve ${errors.length - 5} hata daha`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
