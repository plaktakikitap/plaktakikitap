/**
 * letterboxd_films.json dosyasındaki filmleri veritabanına ekler.
 * Her diary satırı = bir izlenme (aynı film tekrar izlendiyse birden fazla films satırı).
 * poster/spine boş (sonradan yüklenir).
 *
 * Kullanım: npm run import:letterboxd
 * Önce: npx tsx scripts/parse-letterboxd-csv.ts "path/to/letterboxd-export-folder"
 */

import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, "output", "letterboxd_films.json");

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

function loadEnv(): void {
  const projectRoot = path.resolve(__dirname, "..");
  const envLocal = path.join(projectRoot, ".env.local");
  if (fs.existsSync(envLocal)) {
    config({ path: envLocal });
  } else {
    config({ path: path.join(projectRoot, ".env") });
  }
}

interface LetterboxdFilmRecord {
  title: string;
  year: number | null;
  watched_date: string;
  rating_5: number | null;
  review: string | null;
  director: string | null;
  duration_min?: number;
}

async function main(): Promise<void> {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || url === "YOUR_SUPABASE_URL" || serviceKey === "YOUR_SERVICE_ROLE_KEY") {
    console.error("Hata: .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.");
    process.exit(1);
  }

  if (!fs.existsSync(JSON_PATH)) {
    console.error("Hata: Önce letterboxd_films.json oluşturun: npx tsx scripts/parse-letterboxd-csv.ts \"path/to/letterboxd-folder\"");
    process.exit(1);
  }

  const raw = fs.readFileSync(JSON_PATH, "utf-8");
  let list: LetterboxdFilmRecord[];
  try {
    list = JSON.parse(raw) as LetterboxdFilmRecord[];
  } catch {
    console.error("Hata: JSON geçersiz.");
    process.exit(1);
  }

  if (!Array.isArray(list) || list.length === 0) {
    console.log("Liste boş veya geçersiz.");
    return;
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: contentList } = await supabase
    .from("content_items")
    .select("id, title")
    .eq("type", "film");
  const { data: filmsList } = await supabase.from("films").select("content_id, year");
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

  let imported = 0;
  let contentCreated = 0;
  const errors: string[] = [];

  for (const film of list) {
    const title = (film.title ?? "").trim();
    if (!title) continue;
    const year = film.year != null && !Number.isNaN(film.year) ? film.year : null;
    const watchedAt = (film.watched_date ?? "").trim();
    const watched_at = watchedAt
      ? new Date(watchedAt).toISOString()
      : new Date().toISOString();
    const duration = (film.duration_min ?? 90) >= 1 ? film.duration_min! : 90;

    let contentId = contentByKey.get(key(title, year));
    if (!contentId) {
      const slug = slugify(title) + "-" + Date.now();
      const { data: content, error: contentError } = await supabase
        .from("content_items")
        .insert({
          type: "film",
          title,
          slug,
          description: null,
          rating: film.rating_5 != null ? film.rating_5 * 2 : null,
          visibility: "public",
        })
        .select("id")
        .single();
      if (contentError) {
        errors.push(`${title}: ${contentError.message}`);
        continue;
      }
      if (!content?.id) continue;
      contentId = content.id;
      contentByKey.set(key(title, year), contentId);
      contentCreated += 1;
    }

    const { error: filmError } = await supabase.from("films").insert({
      content_id: contentId,
      duration_min: duration,
      year,
      poster_url: null,
      spine_url: null,
      review: (film.review ?? "").trim() || null,
      director: (film.director ?? "").trim() || null,
      genre_tags: null,
      rating_5: film.rating_5 ?? null,
      watched_at,
      is_favorite: false,
      favorite_order: null,
    });

    if (filmError) {
      errors.push(`${title} (${watchedAt}): ${filmError.message}`);
      continue;
    }
    imported += 1;
  }

  console.log("--- Import özeti ---");
  console.log(`Toplam izlenme (JSON): ${list.length}`);
  console.log(`Eklenen izlenme: ${imported}`);
  console.log(`Yeni content (film): ${contentCreated}`);
  if (errors.length > 0) {
    console.log("Hatalar:");
    errors.forEach((e) => console.log("  -", e));
  }
  console.log("\n/izleme-gunlugum/filmler sayfasında filmler görünecek. Poster ve yan görsel sonradan yüklenebilir.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
