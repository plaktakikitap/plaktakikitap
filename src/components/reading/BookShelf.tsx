"use client";

import { useState, useCallback, useRef, useLayoutEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";
import type { Book } from "@/types/database";
import styles from "./BookShelf.module.css";

const BASE_SPINE_HEIGHT_PX = 300;

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

const MIN_SPINE_WIDTH_PX = 34;
const MAX_SPINE_WIDTH_PX = 78;

/** width = clamp(34, 34 + Math.sqrt(page_count) * 2.6, 78) — daha geniş sırtlar, okunaklı yazı */
function spineWidthPx(book: { page_count?: number | null; pages?: number | null }): number {
  const pages = book.page_count ?? book.pages ?? 100;
  const w = 34 + Math.sqrt(pages) * 2.6;
  return Math.round(Math.max(MIN_SPINE_WIDTH_PX, Math.min(MAX_SPINE_WIDTH_PX, w)));
}

/** Deterministic height offset from book id hash: -6px .. +6px (stable across re-renders) */
function spineHeightVariationPx(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000;
  const t = h / 1000;
  return Math.round(t * 12 - 6);
}

/** Page-load shelving: shelf starts empty, spines appear left-to-right with stagger (deterministic, no random) */
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

/** Görselin en-boy oranına göre sırt genişliği ve yüksekliği (kırpma yok). */
function spineSizeFromAspect(
  naturalWidth: number,
  naturalHeight: number
): { widthPx: number; heightPx: number } {
  if (naturalHeight <= 0) return { widthPx: spineWidthPx({ pages: 100 }), heightPx: BASE_SPINE_HEIGHT_PX };
  const aspect = naturalWidth / naturalHeight;
  let widthPx = Math.round(BASE_SPINE_HEIGHT_PX * aspect);
  widthPx = Math.max(MIN_SPINE_WIDTH_PX, Math.min(MAX_SPINE_WIDTH_PX, widthPx));
  const heightPx = Math.round(widthPx / aspect);
  return { widthPx, heightPx };
}

export function BookShelf({ books, onSelectBook }: BookShelfProps) {
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(() => new Set());
  const [imageDimensions, setImageDimensions] = useState<Record<string, { w: number; h: number }>>({});
  const [shelfTops, setShelfTops] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageError = useCallback((bookId: string) => {
    setFailedImageIds((prev) => new Set(prev).add(bookId));
  }, []);

  const handleImageLoad = useCallback((bookId: string, w: number, h: number) => {
    if (w > 0 && h > 0) setImageDimensions((prev) => ({ ...prev, [bookId]: { w, h } }));
  }, []);

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
      <p className="py-12 text-center text-white/50">
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
            const spineImage = book.spine_url || book.cover_url;
            const usePlaceholder = !spineImage || failedImageIds.has(book.id);
            const dims = imageDimensions[book.id];
            const fromImage = dims != null;
            const { widthPx, heightPx: heightFromImage } = fromImage
              ? spineSizeFromAspect(dims.w, dims.h)
              : { widthPx: spineWidthPx(book), heightPx: BASE_SPINE_HEIGHT_PX };
            const heightStyle = fromImage
              ? `${heightFromImage + heightVariationPx}px`
              : `calc(clamp(260px, 28vw, 430px) + ${heightVariationPx}px)`;

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
                    className={`${styles.spine} ${usePlaceholder ? styles.spinePlaceholderOuter : ""}`}
                    style={{
                      width: widthPx,
                      minWidth: widthPx,
                      height: heightStyle,
                      minHeight: heightStyle,
                    }}
                  >
                    <div className={styles.spineInner}>
                      {!usePlaceholder ? (
                        <img
                          src={spineImage!}
                          alt=""
                          className={styles.spineImage}
                          loading="lazy"
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            handleImageLoad(book.id, img.naturalWidth, img.naturalHeight);
                          }}
                          onError={() => handleImageError(book.id)}
                        />
                      ) : (
                        <div className={styles.spinePlaceholder}>
                          <span className={styles.spineTitleText} aria-hidden>
                            {book.title}
                          </span>
                        </div>
                      )}
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
