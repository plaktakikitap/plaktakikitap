"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Quote } from "@/lib/quotes";

interface BookQuotesPanelProps {
  open: boolean;
  onClose: () => void;
  bookTitle: string;
  quotes: Quote[];
  loading?: boolean;
}

export function BookQuotesPanel({
  open,
  onClose,
  bookTitle,
  quotes,
  loading,
}: BookQuotesPanelProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Paneli kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/25 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`${bookTitle} alıntıları`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-rule bg-cream shadow-[-12px_0_40px_rgba(26,22,18,0.12)]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-rule px-5 py-4">
              <div className="min-w-0">
                <p className="section-eyebrow">Alıntılar</p>
                <h3 className="mt-1 truncate font-editorial text-lg text-ink">
                  {bookTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-ink-muted transition hover:bg-ink/5 hover:text-ink"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {loading ? (
                <p className="text-sm text-ink-muted">Yükleniyor…</p>
              ) : quotes.length === 0 ? (
                <p className="text-sm text-ink-muted">Bu kitap için henüz alıntı yok.</p>
              ) : (
                <ul className="space-y-8">
                  {quotes.map((q) => (
                    <li key={q.id}>
                      <span
                        className="block font-display text-4xl leading-none text-gold/70"
                        aria-hidden
                      >
                        “
                      </span>
                      <p className="mt-1 font-editorial text-[1.05rem] leading-relaxed text-ink">
                        {q.text}
                      </p>
                      {q.page_number != null ? (
                        <p className="mt-2 text-xs tracking-wide text-ink-muted">
                          s. {q.page_number}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
