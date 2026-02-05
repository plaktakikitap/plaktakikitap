"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PublishedBook } from "@/types/database";
import { ShoppingCart, X } from "lucide-react";

interface PublishedBooksSectionProps {
  books: PublishedBook[];
}

function LanguageCapsule({ source, target }: { source: string; target: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 font-light tracking-widest text-amber-800 dark:bg-amber-400/20 dark:text-amber-200">
      {source.toUpperCase()} → {target.toUpperCase()}
    </span>
  );
}

export function PublishedBooksSection({ books }: PublishedBooksSectionProps) {
  const [modalBook, setModalBook] = useState<PublishedBook | null>(null);

  if (books.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-6 font-editorial text-xl font-medium text-[var(--foreground)] sm:text-2xl">
        Yayınlanmış kitaplar
      </h2>
      <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
        {books.map((book, i) => (
          <motion.article
            key={book.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="group relative w-[160px] shrink-0 sm:w-[180px]"
          >
            <button
              type="button"
              onClick={() => setModalBook(book)}
              className="block w-full text-left"
            >
              <CardContent book={book} />
            </button>
            <div className="mt-2 text-center">
              <p className="font-editorial text-sm font-medium text-[var(--foreground)] line-clamp-2">
                {book.title}
              </p>
              {book.source_lang && book.target_lang && (
                <div className="mt-1.5 flex justify-center">
                  <LanguageCapsule source={book.source_lang} target={book.target_lang} />
                </div>
              )}
              {(book.author || book.year) && (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {[book.author, book.year].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </motion.article>
        ))}
      </div>

      <AnimatePresence>
        {modalBook && (
          <BookDetailModal book={modalBook} onClose={() => setModalBook(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

function BookDetailModal({
  book,
  onClose,
}: {
  book: PublishedBook;
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
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden
      />
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "tween", duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="aspect-[2/3] w-full overflow-hidden bg-gradient-to-b from-[#f5f0e8] to-[#ebe4d9]">
          {book.cover_image ? (
            <img
              src={book.cover_image}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
              <span className="line-clamp-3 text-sm font-medium text-[var(--muted)]">
                {book.title}
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-editorial text-lg font-medium text-[var(--foreground)]">
            {book.title}
          </h3>
          {book.source_lang && book.target_lang && (
            <div className="mt-2">
              <LanguageCapsule source={book.source_lang} target={book.target_lang} />
            </div>
          )}
          {(book.author || book.publisher || book.year) && (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {[book.author, book.publisher, book.year].filter(Boolean).join(" · ")}
            </p>
          )}
          {book.translator_note?.trim() && (
            <div
              className="mt-4 rounded-lg border border-amber-200/60 bg-[#f5f0e6] bg-[length:200px_200px] p-4 shadow-inner dark:border-amber-800/40 dark:bg-[#2c2820]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
              }}
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
          {book.is_released && book.amazon_url ? (
            <a
              href={book.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:opacity-90"
            >
              <ShoppingCart className="h-4 w-4" />
              Satın Al
            </a>
          ) : !book.is_released ? (
            <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
              Çok Yakında
            </p>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CardContent({ book }: { book: PublishedBook }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-sm transition duration-200 group-hover:border-[var(--accent)]/30 group-hover:shadow-md">
      <div className="aspect-[2/3] w-full overflow-hidden bg-gradient-to-b from-[#f5f0e8] to-[#ebe4d9]">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
            <span className="line-clamp-3 text-xs font-medium text-[var(--muted)]">
              {book.title}
            </span>
          </div>
        )}
      </div>
      {!book.is_released && (
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-center bg-black/50 py-2 text-xs font-medium uppercase tracking-wider text-white/95 backdrop-blur-[2px]"
          aria-hidden
        >
          Çok Yakında
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
    </div>
  );
}
