/**
 * page_count = 1 (import placeholder) olan kitaplar için Open Library'den
 * sayfa sayısı çeker ve books tablosunu günceller.
 *
 * Kullanım: npx tsx scripts/fill-book-page-counts.ts
 */

import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DELAY_MS = 220;
const UA = "plaktakikitap/1.0 (personal library page-count backfill)";

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

function isLikelyMangaVolume(title: string): boolean {
  return (
    /\b(\d+\.\s*cilt|cilt\s*[-–]?\s*\d+|vol\.?\s*\d+)\b/i.test(title) ||
    /sınıfı\s+\d+/i.test(title)
  );
}

async function openLibraryPages(query: string): Promise<number | null> {
  const url =
    "https://openlibrary.org/search.json?" +
    new URLSearchParams({
      q: query,
      fields: "title,number_of_pages_median",
      limit: "1",
    }).toString();
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    docs?: { number_of_pages_median?: number }[];
  };
  const pages = json.docs?.[0]?.number_of_pages_median;
  if (typeof pages === "number" && pages >= 20 && pages <= 2500) return Math.round(pages);
  return null;
}

async function lookupPages(title: string, author: string): Promise<number | null> {
  const queries = [
    author ? `title:${title} author:${author}` : `title:${title}`,
    `title:${title}`,
  ];
  for (const q of queries) {
    try {
      const pages = await openLibraryPages(q);
      if (pages) return pages;
    } catch {
      // try next
    }
    await sleep(DELAY_MS);
  }
  if (isLikelyMangaVolume(title)) return 192;
  return null;
}

async function main(): Promise<void> {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Hata: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, page_count")
    .lte("page_count", 1);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  const rows = data ?? [];
  console.log(`${rows.length} kitap page_count<=1, Open Library taranıyor…`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const title = (row.title ?? "").trim();
    if (!title) {
      skipped += 1;
      continue;
    }
    const pages = await lookupPages(title, (row.author ?? "").trim());
    if (!pages) {
      skipped += 1;
      if ((i + 1) % 25 === 0) {
        console.log(`${i + 1}/${rows.length} — güncellenen ${updated}, atlanan ${skipped}`);
      }
      continue;
    }
    const { error: upErr } = await supabase
      .from("books")
      .update({ page_count: pages })
      .eq("id", row.id);
    if (upErr) {
      failed += 1;
      console.error("update fail", title, upErr.message);
    } else {
      updated += 1;
      console.log(`✓ ${title} → ${pages}`);
    }
  }

  console.log(`Bitti. güncellenen=${updated} atlanan=${skipped} hata=${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
