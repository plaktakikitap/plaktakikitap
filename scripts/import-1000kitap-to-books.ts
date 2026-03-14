/**
 * 1000kitap_books.json dosyasındaki kitapları veritabanına ekler.
 * /readings sayfasında görünmeleri için books tablosuna insert yapar.
 *
 * Eşleme:
 *   title       → title
 *   author      → author
 *   finished_at → end_date (okuma bitiş tarihi)
 *   cover_url   → cover_url ve spine_url (kapak görseli hem kapak hem sırt olarak)
 *
 * Varsayılanlar: status = "finished", page_count = 1, visibility = "public"
 *
 * Kullanım: npm run import:1000kitap
 * Önce: npm run scrape:1000kitap (veya HTML ile) ile JSON üretin.
 */

import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, "output", "1000kitap_books.json");

interface BookRecord {
  title: string;
  author: string;
  finished_at: string;
  cover_url: string | null;
  source_url: string | null;
  page_count?: number | null;
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
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || url === "YOUR_SUPABASE_URL" || serviceKey === "YOUR_SERVICE_ROLE_KEY") {
    console.error("Hata: .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.");
    process.exit(1);
  }

  if (!fs.existsSync(JSON_PATH)) {
    console.error("Hata: Önce 1000kitap_books.json oluşturun: npm run scrape:1000kitap");
    process.exit(1);
  }

  const raw = fs.readFileSync(JSON_PATH, "utf-8");
  let list: BookRecord[];
  try {
    list = JSON.parse(raw) as BookRecord[];
  } catch {
    console.error("Hata: JSON geçersiz.");
    process.exit(1);
  }

  if (!Array.isArray(list) || list.length === 0) {
    console.log("Liste boş veya geçersiz.");
    return;
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Veritabanında zaten var olan kitaplar (title + author) — tekrar eklememek için
  const existingKeys = new Set<string>();
  const { data: existingBooks } = await supabase.from("books").select("title, author");
  if (existingBooks) {
    for (const b of existingBooks) {
      const t = (b.title ?? "").trim().toLowerCase();
      const a = (b.author ?? "").trim().toLowerCase();
      existingKeys.add(`${t}|${a}`);
    }
  }

  function key(title: string, author: string): string {
    return `${title.trim().toLowerCase()}|${(author ?? "").trim().toLowerCase()}`;
  }

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const book of list) {
    const title = (book.title ?? "").trim();
    const author = (book.author ?? "").trim();
    if (!title) {
      skipped += 1;
      continue;
    }

    if (existingKeys.has(key(title, author))) {
      skipped += 1;
      continue;
    }

    const pageCount = book.page_count != null && book.page_count >= 1 && book.page_count <= 99999
      ? book.page_count
      : 1;

    const row = {
      title,
      author: author || "",
      page_count: pageCount,
      status: "finished" as const,
      rating: null,
      tags: [] as string[],
      review: null,
      cover_url: (book.cover_url ?? "").trim() || null,
      spine_url: (book.cover_url ?? "").trim() || null,
      start_date: null,
      end_date: (book.finished_at ?? "").trim() || null,
      progress_percent: null,
      visibility: "public" as const,
      is_featured_current: false,
    };

    const { error } = await supabase.from("books").insert(row).select("id").single();

    if (error) {
      if (error.code === "23505") {
        skipped += 1;
      } else {
        errors.push(`${title}: ${error.message}`);
      }
      continue;
    }
    imported += 1;
    existingKeys.add(key(title, author)); // Aynı JSON içinde tekrar varsa atla
  }

  console.log("--- Import özeti ---");
  console.log(`Toplam kayıt (JSON): ${list.length}`);
  console.log(`Eklenen: ${imported}`);
  console.log(`Atlanan: ${skipped}`);
  if (errors.length > 0) {
    console.log("Hatalar:");
    errors.forEach((e) => console.log("  -", e));
  }
  console.log("\n/readings sayfasında kitaplar görünecek. Kapak görseli cover_url ve spine_url olarak kaydedildi.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
