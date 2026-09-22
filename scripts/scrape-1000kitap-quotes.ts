/**
 * 1000kitap.com hesabına girip /plaktakikitap/alintilari sayfasındaki
 * alıntıları çeker; scripts/output/quotes.json yazar.
 *
 * Kullanım:
 *   npm run scrape:quotes
 *
 * Gereken env (.env.local):
 *   BINBIR_EMAIL
 *   BINBIR_PASSWORD
 *
 * İlk seferde tarayıcı binary'si için:
 *   npx playwright install chromium
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { chromium, type Page } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "quotes.json");

const LOGIN_URL = "https://1000kitap.com/giris";
const QUOTES_URL = "https://1000kitap.com/plaktakikitap/alintilari";

type ScrapedQuote = {
  text: string;
  book_title: string;
  author: string;
  page_number: number | null;
};

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

async function dismissOverlays(page: Page): Promise<void> {
  const labels = [/kabul/i, /tamam/i, /anladım/i, /accept/i, /close/i, /kapat/i];
  for (const name of labels) {
    const btn = page.getByRole("button", { name }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ timeout: 1500 }).catch(() => undefined);
    }
  }
}

async function login(page: Page, email: string, password: string): Promise<void> {
  console.log("Giriş sayfasına gidiliyor…");
  console.log("Cloudflare çıkarsa tarayıcıda doğrulamayı tamamla.");
  await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await dismissOverlays(page);

  const emailBox = page
    .locator(
      'input[type="email"], input[type="text"], input[name="email"], input[name="eposta"], input[name="username"], input[placeholder*="posta" i], input[placeholder*="mail" i], input[placeholder*="E-posta" i], input[placeholder*="kullanıcı" i]'
    )
    .first();
  const passBox = page.locator('input[type="password"]').first();

  await passBox.waitFor({ state: "visible", timeout: 120_000 });
  await emailBox.fill(email);
  await passBox.fill(password);

  const submit = page
    .getByRole("button", { name: /giriş/i })
    .or(page.locator('button[type="submit"], input[type="submit"]'))
    .first();
  await submit.click();

  await page.waitForURL((url) => !url.pathname.includes("/giris"), {
    timeout: 45_000,
  });
  console.log("Giriş başarılı.");
}

async function loadAllQuotes(page: Page): Promise<void> {
  console.log("Tüm alıntılar yüklenene kadar kaydırılıyor…");
  let lastCount = 0;
  let stable = 0;

  for (let i = 0; i < 250; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(900);

    const count = await page.evaluate(
      () => document.querySelectorAll('a[href*="/kitap/"]').length
    );

    if (count <= lastCount) {
      stable += 1;
      if (stable >= 4) break;
    } else {
      stable = 0;
      lastCount = count;
      if (i % 5 === 0) console.log(`  yüklenen kitap linki: ${count}`);
    }
  }
}

function extractQuotesInPage(): ScrapedQuote[] {
  const PAGE_RE = /sayfa\s*[:.]?\s*(\d{1,5})/i;
  const seen = new Set<string>();
  const out: ScrapedQuote[] = [];

  const bookLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('a[href*="/kitap/"]')
  );

  for (const link of bookLinks) {
    const href = link.getAttribute("href") ?? "";
    if (!/\/kitap\/[^/]+/.test(href)) continue;

    const card =
      link.closest("article, li, [class*='alinti'], [class*='quote']") ??
      link.closest("div");
    if (!card) continue;

    const bookTitle = (link.textContent ?? "").replace(/\s+/g, " ").trim();
    if (!bookTitle || bookTitle.length < 2) continue;

    const authorLink = card.querySelector<HTMLAnchorElement>('a[href*="/yazar/"]');
    const author = (authorLink?.textContent ?? "").replace(/\s+/g, " ").trim();

    const rawText = (card.textContent ?? "").replace(/\s+/g, " ").trim();
    let text = rawText;
    text = text.replace(bookTitle, " ").replace(author, " ");
    text = text.replace(/kitabı okuyor|okudu|beğen|yorum|paylaş/gi, " ");
    const pageMatch = text.match(PAGE_RE);
    const page_number = pageMatch ? parseInt(pageMatch[1] ?? "", 10) : null;
    text = text.replace(PAGE_RE, " ").replace(/\s+/g, " ").trim();

    const paragraphs = Array.from(card.querySelectorAll("p, blockquote, [class*='alinti']"))
      .map((el) => (el.textContent ?? "").replace(/\s+/g, " ").trim())
      .filter((t) => t.length > 20 && !/\/kitap\//.test(t));

    if (paragraphs.length > 0) {
      text = paragraphs.sort((a, b) => b.length - a.length)[0] ?? text;
      text = text.replace(PAGE_RE, " ").replace(/\s+/g, " ").trim();
    }

    if (text.length < 12) continue;
    if (text === bookTitle || text === author) continue;

    const key = `${bookTitle}::${text.slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      text,
      book_title: bookTitle,
      author,
      page_number:
        page_number && Number.isFinite(page_number) && page_number > 0
          ? page_number
          : null,
    });
  }

  return out;
}

async function main(): Promise<void> {
  loadEnv();

  const email = process.env.BINBIR_EMAIL?.trim();
  const password = process.env.BINBIR_PASSWORD?.trim();
  if (!email || !password) {
    console.error("Hata: .env.local içinde BINBIR_EMAIL ve BINBIR_PASSWORD tanımlı olmalı.");
    process.exit(1);
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      channel: "chrome",
      args: ["--disable-blink-features=AutomationControlled"],
    });
  } catch {
    browser = await chromium.launch({
      headless: false,
      args: ["--disable-blink-features=AutomationControlled"],
    });
  }
  const context = await browser.newContext({
    locale: "tr-TR",
    viewport: { width: 1280, height: 900 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    await login(page, email, password);
    await dismissOverlays(page);

    console.log("Alıntılar sayfasına gidiliyor…");
    await page.goto(QUOTES_URL, { waitUntil: "networkidle", timeout: 90_000 });
    await dismissOverlays(page);
    await sleep(1200);

    await loadAllQuotes(page);

    const quotes = await page.evaluate(extractQuotesInPage);
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(quotes, null, 2), "utf-8");
    console.log(`${quotes.length} alıntı kaydedildi`);
    console.log(`Dosya: ${OUTPUT_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
