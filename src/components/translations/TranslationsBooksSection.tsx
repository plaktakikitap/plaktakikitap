"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TranslationBookRow } from "@/types/database";
import { ShoppingCart, X } from "lucide-react";
import { LanguagePill } from "./LanguagePill";

const glassPanel = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(16px)",
  boxShadow: "0 0 0 1px rgba(212,182,90,0.2), 0 0 60px -12px rgba(212,182,90,0.12)",
};

const parchmentBg = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
};

export function TranslationsBooksSection({ books }: { books: TranslationBookRow[] }) {
  const [modalBook, setModalBook] = useState<TranslationBookRow | null>(null);

  if (books.length === 0) return null;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-14"
      >
        <h2 className="font-editorial text-xl font-medium text-[var(--foreground)] sm:text-2xl mb-6">
          Yayınlanmış Kitaplar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {books.map((book, i) => (
            <motion.article
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.3 }}
              className="group"
            >
              <button
                type="button"
                onClick={() => setModalBook(book)}
                className="w-full text-left rounded-xl overflow-hidden border border-amber-400/20 bg-white/5 backdrop-blur-sm transition-all duration-200 hover:border-amber-400/40 hover:shadow-[0_0_30px_-5px_rgba(212,182,90,0.2)]"
              >
                <div className="relative aspect-[2/3] bg-gradient-to-b from-[#f5f0e8] to-[#ebe4d9]">
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                  />
                  {!book.is_released && (
                    <div className="absolute inset-x-0 top-0 flex items-center justify-center bg-black/50 py-2 text-xs font-medium uppercase tracking-wider text-white/95 backdrop-blur-[2px]">
                      {book.status_badge || "Çok Yakında"}
                    </div>
                  )}
                  {book.is_released && book.amazon_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <span className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                        <ShoppingCart className="h-4 w-4" />
                        Satın Al
                      </span>
                    </div>
                  )}
                  {!book.is_released && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
                      <div
                        className="h-full bg-amber-500/80 transition-all"
                        style={{ width: `${book.completion_percentage}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-editorial font-medium text-[var(--foreground)] line-clamp-2">
                    {book.title}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">{book.original_author}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {[book.publisher, book.year].filter(Boolean).join(" · ")}
                  </p>
                  {book.source_lang && book.target_lang && (
                    <div className="mt-2">
                      <LanguagePill source={book.source_lang} target={book.target_lang} />
                    </div>
                  )}
                </div>
              </button>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <AnimatePresence>
        {modalBook && (
          <BookDetailModal book={modalBook} onClose={() => setModalBook(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

function BookDetailModal({
  book,
  onClose,
}: {
  book: TranslationBookRow;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "tween", duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-amber-400/25 bg-[var(--card)] shadow-xl"
        style={glassPanel}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-[var(--muted)] hover:bg-white/10 hover:text-[var(--foreground)]"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-2/5 shrink-0 aspect-[2/3] sm:aspect-auto sm:min-h-[320px] bg-gradient-to-b from-[#f5f0e8] to-[#ebe4d9]">
            <img
              src={book.cover_url}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 p-5 sm:p-6 flex flex-col">
            <h3 className="font-editorial text-lg font-medium text-[var(--foreground)]">
              {book.title}
            </h3>
            <p className="text-sm text-[var(--muted)] mt-0.5">{book.original_author}</p>
            {book.source_lang && book.target_lang && (
              <div className="mt-2">
                <LanguagePill source={book.source_lang} target={book.target_lang} />
              </div>
            )}
            <p className="mt-2 text-sm text-[var(--muted)]">
              {[book.publisher, book.year].filter(Boolean).join(" · ")}
            </p>
            {book.translator_note?.trim() && (
              <div
                className="mt-4 rounded-lg border border-amber-200/60 bg-[#f5f0e6] dark:border-amber-800/40 dark:bg-[#2c2820] p-4 shadow-inner"
                style={parchmentBg}
              >
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-800/80 dark:text-amber-200/80">
                  Çevirmenin Notu
                </h4>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
                  {book.translator_note.trim()}
                </p>
                <p
                  className="mt-3 text-right text-sm italic text-amber-900/70 dark:text-amber-100/70"
                  style={{ fontFamily: "var(--font-handwriting), cursive" }}
                >
                  — Çevirmen
                </p>
              </div>
            )}
            <div className="mt-auto pt-4">
              {book.is_released && book.amazon_url ? (
                <a
                  href={book.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600/90 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Satın Al
                </a>
              ) : !book.is_released ? (
                <p className="text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
                  {book.status_badge || "Çok Yakında"}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
