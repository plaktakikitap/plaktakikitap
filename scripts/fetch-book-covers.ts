/**
 * cover_url boş olan kitaplar için Google Books + Open Library kapağı çeker
 * ve books.cover_url günceller.
 *
 * Kullanım: npm run fetch:covers
 *
 * Gereken env (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DELAY_MS = 250;
const PAGE_SIZE = 1000;
const UA = "plaktakikitap/1.0 (personal library cover backfill)";

type BookRow = {
  id: string;
  title: string;
  author: string | null;
  cover_url?: string | null;
  [key: string]: unknown;
};

const COVER_DDL = "ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url text;";

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

function upgradeGoogleCover(url: string): string {
  let out = url.replace(/^http:\/\//i, "https://");
  if (/[?&]zoom=\d/i.test(out)) {
    out = out.replace(/([?&]zoom=)\d+/i, "$13");
  } else {
    out += (out.includes("?") ? "&" : "?") + "zoom=3";
  }
  return out;
}

let skipGoogle = false;

async function searchGoogleBooks(
  title: string,
  author: string
): Promise<string | null> {
  if (skipGoogle) return null;
  const q = author
    ? `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`
    : `intitle:${encodeURIComponent(title)}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (res.status === 429) {
    skipGoogle = true;
    console.log("(Google Books 429 — Open Library'ye geçiliyor)");
    return null;
  }
  if (!res.ok) return null;
  return coverFromGoogleJson(await res.json());
}

function coverFromGoogleJson(json: unknown): string | null {
  const items = (json as {
    items?: {
      volumeInfo?: {
        imageLinks?: { thumbnail?: string; smallThumbnail?: string };
      };
    }[];
  }).items;
  const links = items?.[0]?.volumeInfo?.imageLinks;
  const raw = links?.thumbnail || links?.smallThumbnail;
  if (!raw?.trim()) return null;
  return upgradeGoogleCover(raw.trim());
}

async function searchOpenLibrary(
  title: string,
  author: string
): Promise<string | null> {
  const attempts: Record<string, string>[] = [
    { q: [title, author].filter(Boolean).join(" "), limit: "8" },
    { title, ...(author ? { author } : {}), limit: "8" },
    { title, limit: "8" },
  ];

  for (const params of attempts) {
    const url = `https://openlibrary.org/search.json?${new URLSearchParams(params)}`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) continue;
    const json = (await res.json()) as { docs?: { cover_i?: number }[] };
    const coverI = (json.docs ?? []).find(
      (d) => typeof d.cover_i === "number" && d.cover_i > 0
    )?.cover_i;
    if (coverI) return `https://covers.openlibrary.org/b/id/${coverI}-L.jpg`;
  }
  return null;
}

async function findCover(title: string, author: string): Promise<string | null> {
  try {
    const google = await searchGoogleBooks(title, author);
    if (google) return google;
  } catch {
    // fallback
  }
  try {
    const ol = await searchOpenLibrary(title, author);
    if (ol) return ol;
  } catch {
    // not found
  }
  return null;
}

async function fetchAllBooks(
  supabase: ReturnType<typeof createClient<any>>
): Promise<BookRow[]> {
  const all: BookRow[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Supabase select: ${error.message}`);
    }
    const batch = (data ?? []) as BookRow[];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

async function ensureCoverUrlColumn(
  supabase: ReturnType<typeof createClient<any>>
): Promise<boolean> {
  const { error } = await supabase.from("books").select("cover_url").limit(1);
  if (!error) {
    console.log("cover_url column: exists");
    return true;
  }

  console.log("cover_url column: MISSING —", error.message);
  console.log("Run this SQL in Supabase SQL Editor:");
  console.log(COVER_DDL);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("(DATABASE_URL yok; ALTER otomatik çalıştırılamadı.)");
    return false;
  }

  try {
    const pgMod = (await import("pg")) as { default?: { Client: any }; Client?: any };
    const Client = pgMod.default?.Client ?? pgMod.Client;
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    await client.query(COVER_DDL);
    await client.end();
    console.log("cover_url column: added via DATABASE_URL");
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log("cover_url ALTER failed:", msg);
    return false;
  }
}

function missingCover(book: BookRow): boolean {
  const v = book.cover_url;
  if (v == null || String(v).trim() === "") return true;
  const s = String(v).toLowerCase();
  return s.includes("1000kitap.com");
}

async function main(): Promise<void> {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("YOUR_") || key.includes("YOUR_")) {
    console.error(
      "Hata: .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı."
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const hasCoverCol = await ensureCoverUrlColumn(supabase);

  const books = await fetchAllBooks(supabase);
  console.log(`Supabase books query: ${books.length} rows returned`);

  const columns =
    books[0] != null
      ? Object.keys(books[0])
      : hasCoverCol
        ? ["(no rows — cover_url select succeeded)"]
        : ["(no rows — could not infer columns)"];
  console.log(`books columns: ${columns.join(", ")}`);

  if (!hasCoverCol && (books[0] == null || !("cover_url" in books[0]))) {
    console.error("cover_url yok; kapak güncellemesi atlanıyor.");
    process.exit(1);
  }

  const missing = books.filter(missingCover);
  console.log(`${missing.length} kitap kapağı eksik, taranıyor…\n`);

  let found = 0;
  const total = missing.length;

  for (let i = 0; i < missing.length; i++) {
    const book = missing[i]!;
    const title = (book.title ?? "").trim();
    const author = (book.author ?? "").trim();
    if (!title) {
      console.log("✗ (başlıksız) — not found");
      if (i < missing.length - 1) await sleep(DELAY_MS);
      continue;
    }

    const coverUrl = await findCover(title, author);
    if (!coverUrl) {
      console.log(`✗ ${title} — not found`);
    } else {
      const { error: upErr } = await supabase
        .from("books")
        .update({ cover_url: coverUrl })
        .eq("id", book.id);
      if (upErr) {
        console.log(`✗ ${title} — not found`);
        console.error("  update:", upErr.message);
      } else {
        found += 1;
        console.log(`✓ ${title} — cover found`);
      }
    }

    if (i < missing.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\n${found} / ${total} kitabın kapağı bulundu`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
