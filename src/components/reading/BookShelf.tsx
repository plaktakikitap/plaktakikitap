"use client";

import { motion, LayoutGroup } from "framer-motion";
import type { Book } from "@/types/database";
import { BookOpen } from "lucide-react";
import styles from "./BookShelf.module.css";

const MIN_SPINE_WIDTH_PX = 18;
const MAX_SPINE_WIDTH_PX = 78;

/** width = clamp(18, 18 + Math.sqrt(page_count) * 2.4, 78) — stable responsive spine width */
function spineWidthPx(book: { page_count?: number | null; pages?: number | null }): number {
  const pages = book.page_count ?? book.pages ?? 100;
  const w = 18 + Math.sqrt(pages) * 2.4;
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

export function BookShelf({ books, onSelectBook }: BookShelfProps) {
  if (books.length === 0) {
    return (
      <p className="py-12 text-center text-white/50">
        Henüz kitap eklenmemiş. Kitaplar burada sırt görünümüyle listelenir.
      </p>
    );
  }

  const layoutTransition = { type: "spring" as const, stiffness: 320, damping: 32 };

  return (
    <div className="relative">
      <LayoutGroup>
        <motion.div
          layout
          className="flex flex-wrap items-end justify-center gap-0.5 pt-6 pb-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ layout: layoutTransition }}
        >
          {books.map((book) => {
            const widthPx = spineWidthPx(book);
            const heightVariationPx = spineHeightVariationPx(book.id);
            const spineImage = book.spine_url || book.cover_url;

            return (
              <motion.article
                key={book.id}
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
                  className={styles.spine}
                  style={{
                    width: widthPx,
                    minWidth: widthPx,
                    height: `calc(clamp(260px, 28vw, 430px) + ${heightVariationPx}px)`,
                    minHeight: `calc(clamp(260px, 28vw, 430px) + ${heightVariationPx}px)`,
                  }}
                >
                  <div className={styles.spineInner}>
                    {spineImage ? (
                      <img
                        src={spineImage}
                        alt=""
                        className={styles.spineImage}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.spinePlaceholder}>
                        <BookOpen className="h-8 w-8" aria-hidden />
                      </div>
                    )}
                  </div>
                </div>
                <p
                  className={`${styles.spineTitle} mt-2 max-w-[120px] truncate text-center text-[10px] leading-tight text-white/70 group-hover:text-white/90 sm:max-w-[140px] sm:text-xs`}
                  title={book.title}
                >
                  {book.title}
                </p>
              </button>
            </motion.article>
          );
        })}
      </motion.div>
      </LayoutGroup>
      <div className={styles.shelfBase} aria-hidden role="presentation" />
    </div>
  );
}
