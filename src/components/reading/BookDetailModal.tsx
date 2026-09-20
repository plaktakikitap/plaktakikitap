"use client";

import { useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { X, BookOpen, Quote } from "lucide-react";
import type { Book } from "@/types/database";
import type { Quote as QuoteRow } from "@/lib/quotes";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { InkBleedText } from "@/components/planner/InkBleedText";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { BookQuotesPanel } from "./BookQuotesPanel";

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  /** Clicking a tag filters shelf by that tag and closes modal */
  onTagClick?: (tag: string) => void;
}

const statusLabels: Record<string, string> = {
  reading: "Okunuyor",
  finished: "Bitti",
  paused: "Duraklatıldı",
  dropped: "Bırakıldı",
};

const statusBadgeClass: Record<string, string> = {
  reading: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
  finished: "bg-gold-soft text-gold border-gold/40",
  paused: "bg-ink/5 text-ink-muted border-rule",
  dropped: "bg-rose-500/10 text-rose-700 border-rose-400/30",
};

export function BookDetailModal({
  book,
  onClose,
  onTagClick,
}: BookDetailModalProps) {
  const [quotesOpen, setQuotesOpen] = useState(false);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [hasQuotes, setHasQuotes] = useState(false);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !quotesOpen) onClose();
    },
    [onClose, quotesOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    setQuotesOpen(false);
    setQuotes([]);
    setHasQuotes(false);
    if (!book?.id) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/quotes?book_id=${encodeURIComponent(book.id)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as QuoteRow[];
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setQuotes(list);
        setHasQuotes(list.length > 0);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [book?.id]);

  async function openQuotes() {
    setQuotesOpen(true);
    if (quotes.length > 0 || !book?.id) return;
    setQuotesLoading(true);
    try {
      const res = await fetch(
        `/api/quotes?book_id=${encodeURIComponent(book.id)}`
      );
      if (res.ok) {
        const data = (await res.json()) as QuoteRow[];
        setQuotes(Array.isArray(data) ? data : []);
      }
    } finally {
      setQuotesLoading(false);
    }
  }

  if (!book) return null;

  const coverUrl = book.cover_url;
  const ratingValue = book.rating ?? null;
  const tags = book.tags ?? [];
  const statusLabel = statusLabels[book.status] ?? book.status;
  const badgeClass =
    statusBadgeClass[book.status] ?? "bg-ink/5 text-ink/80 border-rule";
  const inkSeed =
    book.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 1000;

  return (
    <ModalPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-modal-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex w-full max-w-2xl overflow-hidden rounded-2xl border border-rule bg-cream shadow-[0_25px_80px_rgba(26,22,18,0.2)]"
        >
          <div className="relative w-[42%] min-w-[140px] shrink-0 sm:min-w-[180px]">
            <div className="aspect-[2/3] w-full overflow-hidden border-r border-rule bg-ink/5">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink/25">
                  <BookOpen className="h-20 w-20" aria-hidden />
                </div>
              )}
            </div>
          </div>

          <div className="relative flex flex-1 flex-col p-5 sm:p-6">
            <div className="absolute right-3 top-3 flex items-center gap-1">
              <button
                type="button"
                onClick={() => void openQuotes()}
                className={`rounded-full p-1.5 transition ${
                  hasQuotes
                    ? "text-gold hover:bg-gold-soft"
                    : "text-ink-muted/50 hover:bg-ink/5 hover:text-ink-muted"
                }`}
                aria-label="Alıntıları göster"
                title="Alıntılar"
              >
                <Quote className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-ink/70 transition hover:bg-ink/[0.06] hover:text-ink"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2
              id="book-modal-title"
              className="pr-20 font-editorial text-xl font-semibold leading-tight text-ink sm:text-2xl"
            >
              {book.title}
            </h2>

            {book.author && (
              <p className="mt-2 text-sm text-ink/80">
                <span className="text-ink/55">Yazar:</span> {book.author}
              </p>
            )}

            <p className="mt-1 text-sm text-ink/75">
              <span className="text-ink/55">Sayfa:</span> {book.page_count}
            </p>

            <span
              className={`mt-2 inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
            >
              {statusLabel}
            </span>

            {book.start_date && (
              <p className="mt-1.5 text-xs text-ink/60">
                Başlangıç:{" "}
                {new Date(book.start_date).toLocaleDateString("tr-TR")}
              </p>
            )}
            {book.end_date && (
              <p className="mt-0.5 text-xs text-ink/60">
                Bitiş: {new Date(book.end_date).toLocaleDateString("tr-TR")}
              </p>
            )}

            {ratingValue != null && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-ink/55">Puan:</span>
                <StarRatingDisplay
                  value={ratingValue}
                  size="lg"
                  className="text-gold"
                />
                <span className="text-sm text-ink/60">({ratingValue} / 5)</span>
              </div>
            )}

            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      onTagClick?.(tag);
                      onClose();
                    }}
                    className="rounded-full border border-rule bg-card px-2.5 py-1 text-xs font-medium text-ink/90 transition hover:border-gold/40 hover:bg-gold-soft hover:text-gold"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {book.review && (
              <div className="relative mt-4 flex-1 overflow-y-auto pr-1">
                <div
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-[0.07]"
                  style={{
                    background: `radial-gradient(ellipse 70% 60% at 30% 40%, rgba(40,30,50,0.9) 0%, transparent 55%),
                    radial-gradient(ellipse 50% 50% at 70% 70%, rgba(30,25,45,0.7) 0%, transparent 50%)`,
                  }}
                  aria-hidden
                />
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Yorumum
                </p>
                <p
                  className="relative z-10 mt-1.5 text-sm text-ink/95"
                  style={{ lineHeight: 1.65 }}
                >
                  <InkBleedText text={book.review} seed={inkSeed} />
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <BookQuotesPanel
        open={quotesOpen}
        onClose={() => setQuotesOpen(false)}
        bookTitle={book.title}
        quotes={quotes}
        loading={quotesLoading}
      />
    </ModalPortal>
  );
}
