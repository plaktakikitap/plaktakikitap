/**
 * Veritabanında mükerrer film (aynı content_id için birden fazla films satırı) var mı kontrol eder.
 * Kullanım: npx tsx scripts/check-film-duplicates.ts
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

async function main(): Promise<void> {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || url === "YOUR_SUPABASE_URL" || serviceKey === "YOUR_SERVICE_ROLE_KEY") {
    console.error("Hata: .env.local gerekli.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: films } = await supabase
    .from("films")
    .select("id, content_id")
    .order("content_id");

  const countByContent = new Map<string, number>();
  for (const f of films ?? []) {
    const c = countByContent.get(f.content_id) ?? 0;
    countByContent.set(f.content_id, c + 1);
  }

  const duplicates = [...countByContent.entries()].filter(([, n]) => n > 1);
  const totalFilms = films?.length ?? 0;
  const uniqueContents = countByContent.size;

  console.log("--- Film mükerrerlik kontrolü ---");
  console.log(`Toplam films satırı: ${totalFilms}`);
  console.log(`Tekil content_id (film): ${uniqueContents}`);
  if (duplicates.length > 0) {
    console.log(`\nMükerrer (aynı film birden fazla films satırı): ${duplicates.length} film`);
    const { data: items } = await supabase
      .from("content_items")
      .select("id, title")
      .eq("type", "film");
    const map = new Map((items ?? []).map((i) => [i.id, i.title]));
    duplicates.slice(0, 15).forEach(([cid, n]) => {
      console.log(`  - ${map.get(cid) ?? cid}: ${n} kez`);
    });
    if (duplicates.length > 15) {
      console.log(`  ... ve ${duplicates.length - 15} film daha`);
    }
  } else {
    console.log("\nMükerrer film yok.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
