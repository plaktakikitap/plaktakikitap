/**
 * scripts/output/quotes.json → quotes tablosu
 *
 * Kullanım: npm run import:quotes
 *
 * Gereken env (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

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

interface RawQuote {
  quote?: string;
  text?: string;
  book?: string;
  book_title?: string;
  author?: string;
  page_num?: string | number | null;
  page_number?: string | number | null;
  cover?: string;
  cover_url?: string;
  date?: string;
}

function normalizeTitle(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/[''`´]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePage(raw: string | number | null | undefined): number | null {
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

async function importQuotes() {
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

  const quotesPath = path.join(process.cwd(), "scripts", "output", "quotes.json");

  if (!fs.existsSync(quotesPath)) {
    console.error("❌ quotes.json bulunamadı:", quotesPath);
    process.exit(1);
  }

  const rawQuotes: RawQuote[] = JSON.parse(fs.readFileSync(quotesPath, "utf-8"));
  console.log(`📚 ${rawQuotes.length} alıntı yüklendi`);

  const { data: existing, error: fetchErr } = await supabase
    .from("quotes")
    .select("quote, text");

  if (fetchErr) {
    console.error("❌ Mevcut alıntılar okunamadı:", fetchErr.message);
  }

  const existingSet = new Set(
    (existing || []).flatMap((r: { quote?: string | null; text?: string | null }) =>
      [r.quote, r.text].filter((v): v is string => Boolean(v && v.trim()))
    )
  );
  console.log(`📊 Zaten ${existingSet.size} alıntı mevcut`);

  const { data: books } = await supabase.from("books").select("id, title");
  const bookByTitle = new Map<string, string>();
  for (const b of books ?? []) {
    const t = normalizeTitle(String(b.title ?? ""));
    if (t && !bookByTitle.has(t)) bookByTitle.set(t, String(b.id));
  }

  const toInsert = rawQuotes
    .map((q) => {
      const quote = (q.quote ?? q.text ?? "").trim();
      const book = (q.book ?? q.book_title ?? "").trim() || null;
      const author = (q.author ?? "").trim() || null;
      const page = parsePage(q.page_num ?? q.page_number);
      return {
        quote,
        text: quote,
        book,
        author,
        page_num: page,
        page_number: page,
        cover_url: (q.cover ?? q.cover_url ?? "").trim() || null,
        source_date: q.date ? new Date(q.date).toISOString() : null,
        book_id: book ? bookByTitle.get(normalizeTitle(book)) ?? null : null,
      };
    })
    .filter((q) => q.quote && !existingSet.has(q.quote));

  console.log(`➕ ${toInsert.length} yeni alıntı eklenecek`);

  if (toInsert.length === 0) {
    console.log("✅ Eklenecek yeni alıntı yok");
    return;
  }

  let inserted = 0;
  const batchSize = 50;

  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize);
    const { error } = await supabase.from("quotes").insert(batch);

    if (error) {
      console.error(`❌ Batch ${i}-${i + batch.length} hatası:`, error.message);
      console.error("İlk kayıt:", JSON.stringify(batch[0], null, 2));
    } else {
      inserted += batch.length;
      console.log(`✅ ${inserted}/${toInsert.length} alıntı eklendi`);
    }
  }

  console.log(`\n🎉 Tamamlandı! ${inserted} alıntı eklendi.`);

  const bookNames = new Set(
    rawQuotes.map((q) => q.book || q.book_title).filter(Boolean)
  );
  const authors = new Set(rawQuotes.map((q) => q.author).filter(Boolean));
  console.log(`📖 ${bookNames.size} kitap, ${authors.size} yazar`);
}

importQuotes().catch((e) => {
  console.error(e);
  process.exit(1);
});
