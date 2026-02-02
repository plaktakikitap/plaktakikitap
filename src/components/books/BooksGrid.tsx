"use client";

import { motion } from "framer-motion";
import type { ContentItem, Book } from "@/types/database";
import { BookOpen, FileText } from "lucide-react";

type BookItem = ContentItem & { book: Book | Book[] | null };

function getBook(d: BookItem): Book | null {
  const b = d.book;
  if (!b) return null;
  return Array.isArray(b) ? b[0] ?? null : b;
}

interface BooksGridProps {
  books: BookItem[];
}

export function BooksGrid({ books }: BooksGridProps) {
  if (books.length === 0) {
    return (
      <p className="py-12 text-center text-[var(--muted)]">No books yet.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((item, i) => {
        const book = getBook(item);
        if (!book) return null;

        const hasReview = !!book.review?.trim();

        return (
          <motion.article
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02, duration: 0.15 }}
            className="overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--card)] transition hover:border-[var(--accent)]/30"
          >
            {/* Cover */}
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--card-border)]">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                  <BookOpen className="h-12 w-12" />
                </div>
              )}
            </div>

            <div className="p-3">
              <h3 className="font-semibold text-[var(--foreground)] line-clamp-2">
                {item.title}
              </h3>
              {book.author && (
                <p className="mt-1 text-sm text-[var(--muted)] line-clamp-1">
                  {book.author}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--muted)]">
                {item.rating != null && (
                  <span className="text-[var(--accent)]">★ {item.rating}</span>
                )}
                {book.pages && <span>{book.pages} pages</span>}
                {hasReview && (
                  <span className="inline-flex items-center gap-0.5">
                    <FileText className="h-3 w-3" />
                    Reviewed
                  </span>
                )}
              </div>
              {book.quote && (
                <p className="mt-2 line-clamp-2 text-xs italic text-[var(--muted)]">
                  &ldquo;{book.quote}&rdquo;
                </p>
              )}
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
