"use client";

import { motion } from "framer-motion";
import type { ContentItem } from "@/types/database";
import type { Book } from "@/types/database";

type BookWithDetails = ContentItem & {
  book: Book | Book[] | null;
};

function getBook(d: BookWithDetails): Book | null {
  const b = d.book;
  if (!b) return null;
  return Array.isArray(b) ? b[0] ?? null : b;
}

export function BookCard({
  item,
  index,
}: {
  item: BookWithDetails;
  index: number;
}) {
  const book = getBook(item);
  if (!book) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-sm transition hover:shadow-md"
    >
      {book.cover_url && (
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--card-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={book.cover_url}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-[var(--foreground)]">{item.title}</h3>
        {book.author && (
          <p className="mt-1 text-sm text-[var(--muted)]">{book.author}</p>
        )}
        <div className="mt-1 flex gap-2 text-sm text-[var(--muted)]">
          {book.pages && <span>{book.pages} sayfa</span>}
          {item.rating != null && (
            <>
              <span>•</span>
              <span className="text-[var(--accent)]">★ {item.rating}</span>
            </>
          )}
        </div>
        {book.quote && (
          <p className="mt-2 line-clamp-2 italic text-sm text-[var(--muted)]">
            &ldquo;{book.quote}&rdquo;
          </p>
        )}
      </div>
    </motion.article>
  );
}
