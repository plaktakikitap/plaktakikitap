/**
 * books tablosundaki tekrarları siler: aynı title + author ile birden fazla kayıt varsa
 * bir tanesini (en küçük id) bırakır, diğerlerini siler.
 *
 * Tek seferlik kullanım: npx tsx scripts/dedupe-books.ts
 */

import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

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

function key(title: string | null, author: string | null): string {
  return `${(title ?? "").trim().toLowerCase()}|${(author ?? "").trim().toLowerCase()}`;
}

async function main(): Promise<void> {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || url === "YOUR_SUPABASE_URL" || serviceKey === "YOUR_SERVICE_ROLE_KEY") {
    console.error("Hata: .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: books, error: fetchError } = await supabase.from("books").select("id, title, author");
  if (fetchError) {
    console.error("Kitaplar alınamadı:", fetchError.message);
    process.exit(1);
  }
  if (!books?.length) {
    console.log("books tablosu boş.");
    return;
  }

  const byKey = new Map<string, { id: string; title: string }[]>();
  for (const b of books) {
    const k = key(b.title, b.author);
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push({ id: b.id, title: (b.title ?? "").trim() });
  }

  const toDelete: string[] = [];
  for (const [, arr] of byKey) {
    if (arr.length <= 1) continue;
    arr.sort((a, b) => a.id.localeCompare(b.id));
    for (let i = 1; i < arr.length; i++) {
      toDelete.push(arr[i].id);
    }
  }

  if (toDelete.length === 0) {
    console.log("Tekrarlayan kayıt yok. Toplam kitap:", books.length);
    return;
  }

  console.log(`Toplam ${books.length} kayıt. ${toDelete.length} tekrar silinecek, ${books.length - toDelete.length} kalacak.`);

  const BATCH = 100;
  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += BATCH) {
    const chunk = toDelete.slice(i, i + BATCH);
    const { error } = await supabase.from("books").delete().in("id", chunk);
    if (error) {
      console.error("Silme hatası:", error.message);
      process.exit(1);
    }
    deleted += chunk.length;
  }

  console.log(`Silindi: ${deleted}. Kalan kitap sayısı: ${books.length - deleted}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
