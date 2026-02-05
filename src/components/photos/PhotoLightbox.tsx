"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return "";
  }
}

export interface PhotoLightboxItem {
  id: string;
  image_url: string;
  caption: string | null;
  shot_at: string | null;
  created_at: string;
}

interface PhotoLightboxProps {
  open: boolean;
  index: number;
  items: PhotoLightboxItem[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function PhotoLightbox({
  open,
  index,
  items,
  onClose,
  onPrev,
  onNext,
}: PhotoLightboxProps) {
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

  const displayDate = item.shot_at ? formatDate(item.shot_at) : formatDate(item.created_at);

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
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-4"
              aria-label="Önceki"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-4"
              aria-label="Sonraki"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </>
        )}

        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="relative flex max-h-[85vh] max-w-[90vw] flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={item.image_url}
            alt={item.caption || "Fotoğraf"}
            className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            draggable={false}
          />
          {(item.caption || displayDate) && (
            <div className="mt-3 self-start pl-1 text-left text-[11px] tracking-wide text-white/50">
              {item.caption && <span>{item.caption}</span>}
              {item.caption && displayDate && " · "}
              {displayDate && <span>{displayDate}</span>}
            </div>
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
