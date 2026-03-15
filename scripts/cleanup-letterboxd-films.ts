/**
 * Letterboxd'den import edilen film verilerini siler (content_items type=film + films).
 * watched.csv ile yeniden import öncesi çalıştırın.
 *
 * Kullanım: npm run cleanup:letterboxd
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
    console.error("Hata: .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: filmContents, error: listErr } = await supabase
    .from("content_items")
    .select("id")
    .eq("type", "film");

  if (listErr) {
    console.error("Hata (content_items listesi):", listErr.message);
    process.exit(1);
  }

  const ids = (filmContents ?? []).map((c) => c.id);
  if (ids.length === 0) {
    console.log("Silinecek film bulunamadı.");
    return;
  }

  const { error: delFilmsErr } = await supabase.from("films").delete().in("content_id", ids);
  if (delFilmsErr) {
    console.error("Hata (films silme):", delFilmsErr.message);
    process.exit(1);
  }

  const { error: delContentErr } = await supabase.from("content_items").delete().in("id", ids);
  if (delContentErr) {
    console.error("Hata (content_items silme):", delContentErr.message);
    process.exit(1);
  }

  console.log(`--- Temizlik tamamlandı ---`);
  console.log(`${ids.length} film (content_item) ve ilgili films kayıtları silindi.`);
  console.log("Şimdi: npm run parse:letterboxd -- \"path/to/letterboxd-folder\"");
  console.log("Sonra: npm run import:letterboxd");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
