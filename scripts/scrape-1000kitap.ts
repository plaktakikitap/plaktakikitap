/**
 * Tek seferlik script: 1000kitap.com "okuduklarım" sayfasından
 * kitap adı, yazar, okuma tarihi ve kapak URL'sini çeker;
 * tüm sayfaları dolaşır, sonucu JSON dosyasına yazar.
 *
 * Kullanım:
 *   npm run scrape:1000kitap
 *   npx tsx scripts/scrape-1000kitap.ts
 *
 * 403 alırsanız (Cloudflare): Tarayıcıda sayfayı açıp "Farklı Kaydet" ile
 * her sayfa için ayrı HTML kaydedin, sonra hepsini tek komutta verin (hepsi tek JSON’da birleşir):
 *   npx tsx scripts/scrape-1000kitap.ts okuduklarim.html okuduklarim2.html ... okuduklarim59.html
 * İstediğiniz kadar dosya verebilirsiniz (örn. 59 sayfa = 59 HTML).
 */

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

// --- Yapılandırma ---

const BASE_URL = "https://1000kitap.com/eymenyalaz/kitaplari/okuduklari";
const OUTPUT_PATH = path.join(__dirname, "output", "1000kitap_books.json");

/** İsteklerde kullanılacak User-Agent (site bazen bot engelleyebilir) */
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** İstekler arası bekleme (ms) - sunucuyu yormamak için */
const DELAY_MS = 800;

/** Sayfa başına maksimum deneme */
const MAX_RETRIES = 2;

// --- Çıktı tipi ---

export interface BookRecord {
  title: string;
  author: string;
  finished_at: string;
  cover_url: string | null;
  source_url: string | null;
  /** Varsa: HTML'de "X sayfa" / "X sf" gibi metinden çekilir; liste sayfasında genelde yok. */
  page_count?: number | null;
}

// --- Tarih normalizasyonu ---

const TURKISH_MONTHS: Record<string, string> = {
  ocak: "01", oca: "01",
  şubat: "02", şub: "02", subat: "02", sub: "02",
  mart: "03", mar: "03",
  nisan: "04", nis: "04",
  mayıs: "05", mayis: "05", may: "05",
  haziran: "06", haz: "06",
  temmuz: "07", tem: "07",
  ağustos: "08", agustos: "08", ağu: "08", agu: "08",
  eylül: "09", eylul: "09", eyl: "09",
  ekim: "10", eki: "10",
  kasım: "11", kasim: "11", kas: "11",
  aralık: "12", aralik: "12", ara: "12",
};

const ENGLISH_MONTHS: Record<string, string> = {
  jan: "01", january: "01",
  feb: "02", february: "02",
  mar: "03", march: "03",
  apr: "04", april: "04",
  may: "05",
  jun: "06", june: "06",
  jul: "07", july: "07",
  aug: "08", august: "08",
  sep: "09", sept: "09", september: "09",
  oct: "10", october: "10",
  nov: "11", november: "11",
  dec: "12", december: "12",
};

/**
 * Ham tarih metnini mümkünse YYYY-MM-DD formatına çevirir.
 * Başarısızsa ham metni döndürür.
 */
function normalizeDate(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  // Zaten YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return trimmed;

  // DD.MM.YYYY veya DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
  }

  // "DD Ay YYYY" (Türkçe veya İngilizce): "12 Kasım 2023", "10 Mar 2025" (metin içinde de olabilir)
  // Ay kısmı \w+ ile al (Unicode harf dahil); normalize ederek eşle
  const dmyInText = trimmed.match(/(\d{1,2})\s+([A-Za-zÀ-ÿ\u015E\u015F\u0130\u0131\u011E\u011F\u00DC\u00FC\u00D6\u00F6\u00C7\u00E7]+)\s+(\d{4})/);
  const datePart = dmyInText ? `${dmyInText[1]} ${dmyInText[2]} ${dmyInText[3]}` : trimmed;
  const dmyMatch2 = datePart.match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (dmyMatch2) {
    const [, d, monthKey, y] = dmyMatch2;
    const monthNorm = monthKey!
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/i̇/g, "i")
      .replace(/ü/g, "u")
      .replace(/ğ/g, "g")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c");
    const num = TURKISH_MONTHS[monthNorm] ?? ENGLISH_MONTHS[monthNorm];
    if (num) {
      return `${y}-${num}-${d!.padStart(2, "0")}`;
    }
  }

  return trimmed;
}

/** "7.5/10 · 10 Mar 2025 · Puan vermedi" gibi metinden tarih parçasını çıkarır. */
function extractDateFromRatingLine(text: string): string {
  const match = text.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Oca|Şub|Subat|Mart|Nisan|Mayıs|Mayis|Haziran|Temmuz|Ağustos|Agustos|Eylül|Eylul|Ekim|Kasım|Kasim|Aralık|Aralik)\s+(\d{4})/i);
  if (match) {
    return normalizeDate(`${match[1]} ${match[2]} ${match[3]}`);
  }
  return "";
}

/** Kart metninden sayfa sayısı arar: "256 sayfa", "320 sf", "sayfa: 180" vb. */
function extractPageCountFromCard($el: cheerio.Cheerio<AnyNode>, $: cheerio.CheerioAPI): number | null {
  const text = $el.text();
  const sayfaMatch = text.match(/(\d{2,5})\s*sayfa|sayfa\s*[:\s]*(\d{2,5})|(\d{2,5})\s*sf\.?/i);
  if (sayfaMatch) {
    const num = parseInt(sayfaMatch[1] ?? sayfaMatch[2] ?? sayfaMatch[3] ?? "", 10);
    if (!Number.isNaN(num) && num >= 1 && num <= 99999) return num;
  }
  return null;
}

// --- HTML'den kitap listesi çıkarma ---

/**
 * 1000kitap sayfasındaki kitap kartlarını bulmak için kullanılabilecek seçiciler.
 * Site güncellenirse bu seçicileri tarayıcı "İncele" ile kontrol edip güncelleyin.
 */
const POSSIBLE_BOOK_CONTAINERS = [
  // 1000kitap güncel yapı: her satır div.ph-4.pv-2.flex-row, içinde kitap linki + yazar linki
  "div.ph-4.pv-2.flex-row",
  ".kullanici_kitap_liste li",
  ".book-list li",
  ".kitap-listesi .kitap",
  "[class*='kitap'] [class*='liste'] > *",
  ".kl-card",
  "ul.liste li",
  ".content-list .item",
  "article.book",
];

/**
 * Tek bir sayfa HTML'inden kitap kayıtlarını çıkarır.
 */
function extractBooksFromPage(html: string, pageUrl: string): BookRecord[] {
  const $ = cheerio.load(html);
  const books: BookRecord[] = [];

  // Önce kitap konteynerlerini bul (ilk eşleşen seçici kullanılır)
  let $items = $(POSSIBLE_BOOK_CONTAINERS[0]!);
  for (const sel of POSSIBLE_BOOK_CONTAINERS) {
    $items = $(sel);
    if ($items.length > 0) break;
  }

  // Hiçbir seçici işe yaramazsa, kitap detay linklerinden yola çık (her /kitap/ linkini bir kitap sayfası kabul et)
  if ($items.length === 0) {
    const $links = $('a[href*="/kitap/"]').filter((_, el) => {
      const href = $(el).attr("href") ?? "";
      return /\/kitap\/[^/]+\/?$/.test(href) || /\/kitap\/[^/]+\?/.test(href);
    });
    $links.each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href") ?? "";
      const fullUrl = href.startsWith("http") ? href : new URL(href, pageUrl).href;
      const title = $el.find("img").attr("alt") ?? $el.text().trim() ?? "";
      const $card = $el.closest("li, .kl-card, [class*='kitap'], article, .item");
      const author = $card.find("[class*='yazar'], [class*='author'], .yazar, .author").first().text().trim()
        || $el.closest("div").find("p, span").eq(1).text().trim()
        || "";
      const dateText = $card.find("[class*='tarih'], [class*='date'], [class*='okuma']").first().text().trim()
        || $card.text().replace(title, "").replace(author, "").trim();
      const coverUrl = $el.find("img").attr("src") ?? $card.find("img").attr("src") ?? null;

      if (title) {
        books.push({
          title: title.trim(),
          author: author.trim() || "",
          finished_at: normalizeDate(dateText) || dateText || "",
          cover_url: coverUrl ? (coverUrl.startsWith("http") ? coverUrl : new URL(coverUrl, pageUrl).href) : null,
          source_url: fullUrl,
        });
      }
    });
    return books;
  }

  $items.each((_, el) => {
    const $el = $(el);
    const $link = $el.find('a[href*="/kitap/"]').first();
    const href = $link.attr("href") ?? "";
    const fullUrl = href.startsWith("http") ? href : new URL(href, pageUrl).href;

    // Başlık: h3 (1000kitap) veya img alt veya link metni
    const title =
      $el.find("h3").first().text().trim() ||
      $link.find("img").attr("alt")?.trim() ||
      $link.attr("title")?.trim() ||
      $link.text().trim() ||
      $el.find("h4, [class*='baslik'], [class*='title']").first().text().trim() ||
      "";

    // Yazar: 1000kitap'ta a[href*="/yazar/"] (aria-label veya metin)
    const $authorLink = $el.find('a[href*="/yazar/"]').first();
    const author =
      $authorLink.attr("aria-label")?.trim() ||
      $authorLink.text().trim() ||
      $el.find("[class*='yazar'], [class*='author'], .yazar, .author").first().text().trim() ||
      "";

    // Tarih: 1000kitap'ta "7.5/10 · 10 Mar 2025 · ..." formatında span.text-silik içinde
    let dateText = $el.find("time").attr("datetime") ?? "";
    if (!dateText) {
      const ratingSpan = $el.find("span.text-silik, span[class*='silik']").first().text();
      dateText = extractDateFromRatingLine(ratingSpan) || ratingSpan.trim();
    }
    if (!dateText && $el.find("[class*='tarih'], [class*='date']").length) {
      dateText = $el.find("[class*='tarih'], [class*='date']").first().text().trim();
    }
    const finishedAt = dateText ? normalizeDate(dateText) || dateText : dateText;

    const $img = $el.find("img").first();
    const coverUrl = $img.attr("src") ?? $img.attr("data-src") ?? null;

    const page_count = extractPageCountFromCard($el, $);

    if (title) {
      books.push({
        title: title.trim(),
        author: author.trim(),
        finished_at: finishedAt,
        cover_url: coverUrl ? (coverUrl.startsWith("http") ? coverUrl : new URL(coverUrl, pageUrl).href) : null,
        source_url: fullUrl,
        ...(page_count != null ? { page_count } : {}),
      });
    }
  });

  return books;
}

/**
 * Sayfa HTML'inde sonraki sayfa linki var mı kontrol eder; varsa URL döner.
 * Cheerio'da :contains yok; metin ile eşleşen linki filter ile buluyoruz.
 */
function getNextPageUrl($: cheerio.CheerioAPI, currentPageUrl: string): string | null {
  let href = $('a[rel="next"]').attr("href");
  if (href) {
    return href.startsWith("http") ? href : new URL(href, currentPageUrl).href;
  }
  $("a").each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (text === "ileri" || text === "sonraki" || text === "next") {
      href = $(el).attr("href") ?? undefined;
      return false; // break
    }
  });
  if (href != null && href !== "") {
    return href.startsWith("http") ? href : new URL(href, currentPageUrl).href;
  }
  return null;
}

/**
 * İlk sayfayı çekip toplam sayfa sayısını (varsa) döndürür; yoksa null.
 */
function detectTotalPages(html: string): number | null {
  const $ = cheerio.load(html);
  const pagination = $(".pagination, [class*='pagination'], .sayfalama");
  const links = pagination.find("a");
  let max = 0;
  links.each((_, a) => {
    const text = $(a).text().trim();
    const num = parseInt(text, 10);
    if (!Number.isNaN(num) && num > max) max = num;
  });
  const href = pagination.find("a").last().attr("href");
  if (href) {
    const match = href.match(/[?&]sayfa=(\d+)/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  return max > 0 ? max : null;
}

/** İstek atar, gerekirse retry yapar. 403'te anlamlı hata fırlatır. */
async function fetchPage(url: string): Promise<string> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const res = await axios.get<string>(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
        },
        timeout: 15000,
        responseType: "text",
        validateStatus: (s) => s === 200 || s === 403,
      });
      if (res.status === 403) {
        throw new Error(
          "403 Forbidden: 1000kitap Cloudflare ile bot engelliyor olabilir. " +
            "Scripti kendi bilgisayarınızda (farklı ağ / VPN) çalıştırmayı deneyin."
        );
      }
      return res.data;
    } catch (e) {
      if (e instanceof Error && e.message.includes("403")) throw e;
      if (i === MAX_RETRIES - 1) throw e;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error(`Failed to fetch: ${url}`);
}

/** Bekleme. */
function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Ana akış ---

/** Birden fazla HTML dosyası verilmişse hepsini okuyup tek listede birleştirir (duplicate elenir). */
async function main(): Promise<void> {
  console.log("1000kitap okuduklarım scrape başlatıldı.\n");

  const allBooks: BookRecord[] = [];
  const seenKeys = new Set<string>();
  let duplicateCount = 0;
  let totalPagesProcessed = 0;

  const fileArgs = process.argv.slice(2).filter((p) => p && fs.existsSync(p));

  if (fileArgs.length > 0) {
    // Çoklu dosya modu: tüm HTML dosyalarını sırayla oku, kitapları birleştir
    totalPagesProcessed = fileArgs.length;
    for (let i = 0; i < fileArgs.length; i++) {
      const filePath = fileArgs[i]!;
      console.log(`Dosya ${i + 1}/${fileArgs.length} taranıyor: ${filePath}`);
      const html = fs.readFileSync(filePath, "utf-8");
      const pageUrl = BASE_URL;
      const books = extractBooksFromPage(html, pageUrl);
      for (const book of books) {
        const key = `${book.title}|${book.author}`.toLowerCase();
        if (seenKeys.has(key)) {
          duplicateCount += 1;
          continue;
        }
        seenKeys.add(key);
        allBooks.push(book);
      }
    }
  } else {
    // Tek sayfa veya URL: önce opsiyonel tek dosya, sonra URL ile pagination
    let pageCount = 0;
    totalPagesProcessed = 0;
    let nextUrl: string | null = BASE_URL;
    const firstPagePath = process.argv[2];

    while (nextUrl) {
      pageCount += 1;
      console.log(`Sayfa ${pageCount} taranıyor: ${nextUrl}`);

      let html: string;
      if (pageCount === 1 && firstPagePath && fs.existsSync(firstPagePath)) {
        html = fs.readFileSync(firstPagePath, "utf-8");
        console.log("  (ilk sayfa yerel dosyadan okundu)");
      } else {
        html = await fetchPage(nextUrl);
      }
      const books = extractBooksFromPage(html, nextUrl);

      for (const book of books) {
        const key = `${book.title}|${book.author}`.toLowerCase();
        if (seenKeys.has(key)) {
          duplicateCount += 1;
          continue;
        }
        seenKeys.add(key);
        allBooks.push(book);
      }

      const $ = cheerio.load(html);
      nextUrl = getNextPageUrl($, nextUrl);

      if (!nextUrl) {
        const totalPages = detectTotalPages(html);
        if (totalPages != null && pageCount < totalPages) {
          const nextPage = pageCount + 1;
          nextUrl = `${BASE_URL}${BASE_URL.includes("?") ? "&" : "?"}sayfa=${nextPage}`;
        }
      }

      if (nextUrl) await delay(DELAY_MS);
    }
    totalPagesProcessed = pageCount;
  }

  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allBooks, null, 2), "utf-8");

  console.log("\n--- Özet ---");
  console.log(`Taranan toplam sayfa/dosya sayısı: ${totalPagesProcessed}`);
  console.log(`Bulunan toplam kitap sayısı: ${allBooks.length}`);
  console.log(`Duplicate yüzünden elenen kayıt sayısı: ${duplicateCount}`);
  console.log(`Çıktı: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
