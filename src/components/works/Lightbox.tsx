"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  open: boolean;
  index: number;
  items: { image_url: string | null; title: string; meta?: Record<string, unknown> }[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Lightbox({ open, index, items, onClose, onPrev, onNext }: LightboxProps) {
  const item = items[index];
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [open, onClose, onPrev, onNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!open || !item?.image_url) return null;

  const year = item.meta && typeof item.meta.year !== "undefined" ? String(item.meta.year) : null;
  const medium = item.meta && typeof item.meta.medium === "string" ? item.meta.medium : null;
  const location = item.meta && typeof item.meta.location === "string" ? item.meta.location : null;
  const caption = [item.title, year, medium, location].filter(Boolean).join(" · ");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
        onClick={onClose}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          aria-label="Kapat"
        >
          <X className="h-6 w-6" />
        </button>

        {items.length > 1 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-4"
            aria-label="Önceki"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}
        {items.length > 1 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-4"
            aria-label="Sonraki"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="relative max-h-[85vh] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={item.image_url}
            alt={item.title}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            draggable={false}
          />
          {caption && (
            <p className="mt-3 text-center text-sm text-white/80">{caption}</p>
          )}
          {items.length > 1 && (
            <p className="mt-1 text-center text-xs text-white/50">
              {index + 1} / {items.length}
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
