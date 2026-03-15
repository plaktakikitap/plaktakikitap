/**
 * reviews.csv'deki puan ve yorumları veritabanındaki filmlere uygular.
 * Eşleşme: title + year ile. Hem rating hem review güncellenir.
 *
 * Kullanım: npx tsx scripts/apply-letterboxd-reviews.ts "path/to/letterboxd-export-folder"
 *   npm run apply:letterboxd-reviews -- "path/to/letterboxd-export-folder"
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** CSV satırlarını parse eder; tırnak içindeki alanlar çok satırlı olabilir. */
function csvToRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    if (c === '"') {
      if (inQuotes && csvText[i + 1] === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes) {
      if (c === ",") {
        currentRow.push(currentField);
        currentField = "";
        continue;
      }
      if (c === "\n" || c === "\r") {
        if (c === "\r" && csvText[i + 1] === "\n") i++;
        currentRow.push(currentField);
        currentField = "";
        if (currentRow.length > 0 && currentRow.some((cell) => cell.trim().length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        continue;
      }
    }
    currentField += c;
  }
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
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
    console.error("Kullanım: npx tsx scripts/apply-letterboxd-reviews.ts <letterboxd-export-klasörü>");
    process.exit(1);
  }

  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || url === "YOUR_SUPABASE_URL" || serviceKey === "YOUR_SERVICE_ROLE_KEY") {
    console.error("Hata: .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.");
    process.exit(1);
  }

  const reviewsPath = path.join(path.resolve(folderArg), "reviews.csv");
  if (!fs.existsSync(reviewsPath)) {
    console.error("reviews.csv bulunamadı:", reviewsPath);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(reviewsPath, "utf-8");
  const rawRows = csvToRows(csvContent);
  if (rawRows.length < 2) {
    console.log("reviews.csv boş veya yalnızca başlık var.");
    return;
  }

  const headers = rawRows[0]!;
  const rows: Record<string, string>[] = rawRows.slice(1).map((values) => {
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = (values[j] ?? "").trim();
    });
    return row;
  });

  const reviews: { title: string; year: number | null; rating_5: number | null; review: string }[] = [];
  for (const row of rows) {
    const title = get(row, "Name", "Film Title", "Title");
    if (!title) continue;
    const yearRaw = get(row, "Year", "Release Year");
    const year = yearRaw ? parseInt(yearRaw, 10) : null;
    const review = get(row, "Review");
    const ratingVal = parseRating(get(row, "Rating"));
    if (!review && ratingVal == null) continue;
    reviews.push({
      title,
      year: Number.isNaN(year!) ? null : year,
      rating_5: ratingVal ?? null,
      review: review || "",
    });
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

  for (const r of reviews) {
    const contentId = contentByKey.get(key(r.title, r.year));
    if (!contentId) continue;

    const filmsForContent = (filmsList ?? []).filter((f) => f.content_id === contentId);
    const updateData: { review: string; rating_5?: number } = { review: r.review };
    if (r.rating_5 != null) updateData.rating_5 = r.rating_5;

    for (const film of filmsForContent) {
      const { error } = await supabase
        .from("films")
        .update(updateData)
        .eq("id", film.id);
      if (error) {
        errors.push(`${r.title} (${r.year}): ${error.message}`);
      } else {
        updated += 1;
      }
    }

    if (r.rating_5 != null) {
      await supabase
        .from("content_items")
        .update({ rating: r.rating_5 * 2 })
        .eq("id", contentId);
    }
  }

  console.log("--- Reviews güncelleme özeti ---");
  console.log(`reviews.csv satırı: ${reviews.length}`);
  console.log(`Güncellenen film: ${updated}`);
  if (errors.length > 0) {
    console.log("Hatalar:", errors.slice(0, 5).join("; "));
    if (errors.length > 5) console.log(`  ... ve ${errors.length - 5} hata daha`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
