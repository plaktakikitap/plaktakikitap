"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen } from "lucide-react";
import type { Book } from "@/types/database";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { InkBleedText } from "@/components/planner/InkBleedText";

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
  reading: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  finished: "bg-amber-500/20 text-amber-200 border-amber-400/40",
  paused: "bg-slate-500/20 text-slate-200 border-slate-400/40",
  dropped: "bg-rose-500/20 text-rose-200 border-rose-400/40",
};

export function BookDetailModal({
  book,
  onClose,
  onTagClick,
}: BookDetailModalProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!book) return null;

  const coverUrl = book.cover_url;
  const ratingValue = book.rating ?? null;
  const tags = book.tags ?? [];
  const statusLabel = statusLabels[book.status] ?? book.status;
  const badgeClass = statusBadgeClass[book.status] ?? "bg-white/10 text-white/80 border-white/20";
  const inkSeed = book.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 1000;

  return (
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
      {/* Backdrop — click to close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        aria-hidden
      />

      {/* Glassmorphism panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white/[0.08] shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        {/* Left: cover (fixed 2:3 ratio) */}
        <div className="relative w-[42%] min-w-[140px] shrink-0 sm:min-w-[180px]">
          <div className="aspect-[2/3] w-full overflow-hidden border-r border-white/10 bg-black/30">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/30">
                <BookOpen className="h-20 w-20" aria-hidden />
              </div>
            )}
          </div>
        </div>

        {/* Right: content */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-white/70 transition hover:bg-white/15 hover:text-white"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>

          <h2
            id="book-modal-title"
            className="pr-8 font-editorial text-xl font-semibold leading-tight text-white sm:text-2xl"
          >
            {book.title}
          </h2>

          {book.author && (
            <p className="mt-2 text-sm text-white/80">
              <span className="text-white/55">Yazar:</span> {book.author}
            </p>
          )}

          <p className="mt-1 text-sm text-white/75">
            <span className="text-white/55">Sayfa:</span> {book.page_count}
          </p>

          <span
            className={`mt-2 inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
          >
            {statusLabel}
          </span>

          {book.start_date && (
            <p className="mt-1.5 text-xs text-white/60">
              Başlangıç: {new Date(book.start_date).toLocaleDateString("tr-TR")}
            </p>
          )}
          {book.end_date && (
            <p className="mt-0.5 text-xs text-white/60">
              Bitiş: {new Date(book.end_date).toLocaleDateString("tr-TR")}
            </p>
          )}

          {ratingValue != null && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-white/55">Puan:</span>
              <StarRatingDisplay
                value={ratingValue}
                size="lg"
                className="text-amber-400"
              />
              <span className="text-sm text-white/60">({ratingValue} / 5)</span>
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
                  className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90 transition hover:border-amber-400/40 hover:bg-amber-400/20 hover:text-amber-200"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {book.review && (
            <div className="relative mt-4 flex-1 overflow-y-auto pr-1">
              {/* Ink blot overlay — behind review only, very subtle */}
              <div
                className="pointer-events-none absolute inset-0 rounded-lg opacity-[0.07]"
                style={{
                  background: `radial-gradient(ellipse 70% 60% at 30% 40%, rgba(40,30,50,0.9) 0%, transparent 55%),
                    radial-gradient(ellipse 50% 50% at 70% 70%, rgba(30,25,45,0.7) 0%, transparent 50%)`,
                }}
                aria-hidden
              />
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Senin yorumun
              </p>
              <p
                className="relative z-10 mt-1.5 text-sm text-white/95"
                style={{ lineHeight: 1.65 }}
              >
                <InkBleedText text={book.review} seed={inkSeed} />
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
