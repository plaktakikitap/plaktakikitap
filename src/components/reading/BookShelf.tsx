"use client";

import { useState, useCallback, useRef, useLayoutEffect, type CSSProperties } from "react";
import { motion, LayoutGroup } from "framer-motion";
import type { Book } from "@/types/database";
import styles from "./BookShelf.module.css";

const BOOK_COLORS = [
  "#C9B99A", // sıcak kum
  "#B5C4B1", // adaçayı yeşili
  "#C4B5C0", // soluk lavanta
  "#C4B9A8", // açık kahve
  "#B8C4C0", // gri-yeşil
  "#C8BCB0", // grège
  "#BFC4B5", // zeytin-gri
  "#C4BCCA", // soluk mor
  "#C0C4B8", // açık haki
  "#CAB8B8", // soluk rose
] as const;

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Title'dan deterministik pastel renk (aynı kitap → aynı renk) */
function colorFromTitle(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  }
  return BOOK_COLORS[hash % BOOK_COLORS.length]!;
}

/** Supabase spine_color / cover_color doluysa onu, değilse paletten */
function resolveBookColor(book: Book): string {
  const coverColor = (book as { cover_color?: string | null }).cover_color;
  const fromDb =
    (typeof book.spine_color === "string" && book.spine_color.trim()) ||
    (typeof coverColor === "string" && coverColor.trim()) ||
    "";
  if (fromDb && HEX_RE.test(fromDb)) return fromDb;
  return colorFromTitle(book.title || book.id);
}

const ROW_SLOP_PX = 15;

/** Gerçek satır bitişlerini ölçüp her satırın altına raf konumunu (px) döndürür */
function measureShelfTops(containerEl: HTMLElement): number[] {
  const books = containerEl.querySelectorAll<HTMLElement>("[data-book]");
  if (books.length === 0) return [];
  const containerRect = containerEl.getBoundingClientRect();
  const rows: number[] = [];
  let currentRowTop = -1;
  let currentRowBottom = -1;
  for (let i = 0; i < books.length; i++) {
    const r = books[i].getBoundingClientRect();
    const top = r.top - containerRect.top;
    const bottom = r.bottom - containerRect.top;
    if (currentRowTop < 0 || Math.abs(top - currentRowTop) > ROW_SLOP_PX) {
      if (currentRowBottom >= 0) rows.push(currentRowBottom);
      currentRowTop = top;
      currentRowBottom = bottom;
    } else {
      currentRowBottom = Math.max(currentRowBottom, bottom);
    }
  }
  if (currentRowBottom >= 0) rows.push(currentRowBottom);
  return rows;
}

const MIN_PAGES = 50;
const MAX_PAGES = 1000;
const MIN_WIDTH = 18;
const MAX_WIDTH = 52;
const DEFAULT_WIDTH = 28;

function resolvePageCount(book: {
  page_count?: number | null;
  pages?: number | null;
  num_pages?: number | null;
}): number {
  for (const n of [book.page_count, book.pages, book.num_pages]) {
    // 1 = import placeholder, gerçek sayfa sayısı değil
    if (typeof n === "number" && Number.isFinite(n) && n > 1) return n;
  }
  return 0;
}

function spineWidthPx(pages: number): number {
  if (!pages) return DEFAULT_WIDTH;
  const width =
    MIN_WIDTH + ((pages - MIN_PAGES) / (MAX_PAGES - MIN_PAGES)) * (MAX_WIDTH - MIN_WIDTH);
  return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width));
}

/** Deterministic height offset from book id hash: -6px .. +6px */
function spineHeightVariationPx(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000;
  const t = h / 1000;
  return Math.round(t * 12 - 6);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      opacity: { duration: 0.15 },
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

const bookVariants = {
  hidden: { opacity: 0, x: -18 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 26,
      mass: 0.55,
    },
  },
};

interface BookShelfProps {
  books: Book[];
  onSelectBook?: (book: Book) => void;
}

/**
 * Kitaplık — tüm kitaplar pastel sırt + başlık (yan kapak görselleri kullanılmaz).
 */
export function BookShelf({ books, onSelectBook }: BookShelfProps) {
  const [shelfTops, setShelfTops] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateShelfTops = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const tops = measureShelfTops(el);
    setShelfTops((prev) =>
      prev.length === tops.length && prev.every((t, i) => Math.abs(t - tops[i]) < 2) ? prev : tops
    );
  }, []);

  useLayoutEffect(() => {
    updateShelfTops();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateShelfTops);
    ro.observe(el);
    const t = window.setTimeout(updateShelfTops, 700);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [books.length, updateShelfTops]);

  if (books.length === 0) {
    return (
      <p className="py-12 text-center text-ink/50">
        Henüz kitap eklenmemiş. Kitaplar burada sırt görünümüyle listelenir.
      </p>
    );
  }

  const layoutTransition = { type: "spring" as const, stiffness: 320, damping: 32 };

  return (
    <div ref={containerRef} className="relative">
      <LayoutGroup>
        <motion.div
          layout
          className="flex flex-wrap items-end justify-center gap-x-0 gap-y-16 pt-6 pb-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ layout: layoutTransition }}
        >
          {books.map((book) => {
            const heightVariationPx = spineHeightVariationPx(book.id);
            const widthPx = spineWidthPx(resolvePageCount(book));
            const heightStyle = `calc(clamp(260px, 28vw, 430px) + ${heightVariationPx}px)`;
            const bookColor = resolveBookColor(book);

            return (
              <motion.article
                key={book.id}
                data-book
                layout
                variants={bookVariants}
                transition={{ layout: layoutTransition }}
                className="group flex flex-col items-center"
              >
                <button
                  type="button"
                  onClick={() => onSelectBook?.(book)}
                  className="flex flex-col items-center text-left"
                  title={`${book.title}${book.author ? ` — ${book.author}` : ""}`}
                >
                  <div
                    className={`${styles.spine} ${styles.spinePlaceholderOuter}`}
                    style={{
                      width: `${widthPx}px`,
                      minWidth: `${widthPx}px`,
                      maxWidth: `${widthPx}px`,
                      height: heightStyle,
                      minHeight: heightStyle,
                      ["--spine-color" as string]: bookColor,
                    }}
                  >
                    <div className={styles.spineInner}>
                      <div className={styles.spinePlaceholder}>
                        <span className={styles.spineTint} aria-hidden />
                        <span
                          className={styles.spineTitleText}
                          style={
                            {
                              "--title-chars": Math.max(book.title.length, 1),
                            } as CSSProperties
                          }
                        >
                          {book.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.article>
            );
          })}
        </motion.div>
      </LayoutGroup>
      {shelfTops.map((topPx, i) => (
        <div
          key={i}
          className={styles.shelfBase}
          style={{ bottom: "auto", top: `${topPx}px` }}
          aria-hidden
          role="presentation"
        />
      ))}
    </div>
  );
}
