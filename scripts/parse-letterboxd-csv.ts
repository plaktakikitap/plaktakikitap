/**
 * Letterboxd export klasörünü okur (watched.csv + reviews.csv + ratings.csv birleştirir).
 * watched.csv = izleyip logladığın tüm filmler (diary değil).
 *
 * Kullanım:
 *   npx tsx scripts/parse-letterboxd-csv.ts "c:\...\letterboxd-eymenyalaz-2026-03-14-13-50-utc"
 *   npm run parse:letterboxd -- "path/to/letterboxd-export-folder"
 *
 * Çıktı: scripts/output/letterboxd_films.json
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "output", "letterboxd_films.json");

export interface LetterboxdFilmRecord {
  title: string;
  year: number | null;
  watched_date: string;
  rating_5: number | null;
  review: string | null;
  director: string | null;
  duration_min: number;
  letterboxd_uri: string | null;
}

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

function normalizeDate(s: string): string {
  const trimmed = s.trim();
  if (!trimmed) return "";
  const m = trimmed.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const m2 = trimmed.match(/(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/);
  if (m2) {
    const [, d, mo, y] = m2;
    return `${y}-${mo!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
  }
  return trimmed;
}

function main(): void {
  const folderArg = process.argv[2];
  if (!folderArg || !fs.existsSync(folderArg)) {
    console.error("Kullanım: npx tsx scripts/parse-letterboxd-csv.ts <letterboxd-export-klasörü>");
    process.exit(1);
  }
  const folder = path.resolve(folderArg);
  const watchedPath = path.join(folder, "watched.csv");
  const reviewsPath = path.join(folder, "reviews.csv");
  const ratingsPath = path.join(folder, "ratings.csv");

  if (!fs.existsSync(watchedPath)) {
    console.error("watched.csv bulunamadı:", watchedPath);
    process.exit(1);
  }

  const watchedContent = fs.readFileSync(watchedPath, "utf-8");
  const watchedRows = csvToRows(watchedContent);

  const reviewByUri = new Map<string, string>();
  if (fs.existsSync(reviewsPath)) {
    const reviewsContent = fs.readFileSync(reviewsPath, "utf-8");
    const reviewsRows = csvToRows(reviewsContent);
    for (const row of reviewsRows) {
      const uri = get(row, "Letterboxd URI", "LetterboxdURI");
      const review = get(row, "Review");
      if (uri && review) reviewByUri.set(uri.trim(), review);
    }
  }

  const ratingByUri = new Map<string, number>();
  if (fs.existsSync(ratingsPath)) {
    const ratingsContent = fs.readFileSync(ratingsPath, "utf-8");
    const ratingsRows = csvToRows(ratingsContent);
    for (const row of ratingsRows) {
      const uri = get(row, "Letterboxd URI", "LetterboxdURI");
      const r = parseRating(get(row, "Rating"));
      if (uri && r != null) ratingByUri.set(uri.trim(), r);
    }
  }

  const seenKey = new Set<string>();
  const records: LetterboxdFilmRecord[] = [];
  for (const row of watchedRows) {
    const title = get(row, "Name", "Film Title", "Title");
    if (!title) continue;
    const yearRaw = get(row, "Year", "Release Year");
    const year = yearRaw ? parseInt(yearRaw, 10) : null;
    const dedupKey = `${(title ?? "").trim().toLowerCase()}|${year ?? ""}`;
    if (seenKey.has(dedupKey)) continue;
    seenKey.add(dedupKey);

    const watchedRaw = get(row, "Watched Date", "WatchedDate", "Date");
    const watched_date = normalizeDate(watchedRaw) || new Date().toISOString().slice(0, 10);
    const uri = get(row, "Letterboxd URI", "LetterboxdURI");
    const ratingFromDiary = parseRating(get(row, "Rating"));
    const rating_5 = ratingFromDiary ?? (uri ? ratingByUri.get(uri.trim()) ?? null : null);
    const review = uri ? (reviewByUri.get(uri.trim()) ?? null) : null;

    records.push({
      title,
      year: Number.isNaN(year!) ? null : year,
      watched_date,
      rating_5,
      review: review ?? null,
      director: null,
      duration_min: 90,
      letterboxd_uri: uri || null,
    });
  }

  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(records, null, 2), "utf-8");

  console.log("--- Özet ---");
  console.log(`Watched satırı (ham): ${watchedRows.length}`);
  console.log(`Tekil film (deduplicate sonrası): ${records.length}`);
  console.log(`Çıktı: ${OUTPUT_PATH}`);
}

main();
