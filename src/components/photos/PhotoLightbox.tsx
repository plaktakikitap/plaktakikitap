"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { PhotoImage } from "./PhotoImage";

function formatDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
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
  camera?: string | null;
  lens?: string | null;
  film?: string | null;
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
  const touchStartX = useRef<number | null>(null);

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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null || items.length < 2) return;
    const delta = (e.changedTouches[0]?.clientX ?? start) - start;
    if (delta > 50) onPrev();
    else if (delta < -50) onNext();
  }

  const displayDate = item
    ? item.shot_at
      ? formatDate(item.shot_at)
      : formatDate(item.created_at)
    : "";

  const infoParts = item
    ? [
        displayDate || null,
        item.camera?.trim() || null,
        item.lens?.trim() || null,
        item.film?.trim() || null,
      ].filter((v): v is string => Boolean(v))
    : [];

  return (
    <AnimatePresence>
      {open && item?.image_url ? (
        <ModalPortal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            onClick={onClose}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-20 z-20 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:top-4"
              aria-label="Kapat"
            >
              <X className="h-6 w-6" />
            </button>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrev();
                  }}
                  className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-4"
                  aria-label="Önceki"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-4"
                  aria-label="Sonraki"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <div
              className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex max-h-[90vh] max-w-[90vw] items-center justify-center"
                >
                  <PhotoImage
                    src={item.image_url}
                    alt={item.caption || "Fotoğraf"}
                    width={1600}
                    height={1600}
                    className="h-auto max-h-[90vh] w-auto max-w-[90vw] object-contain"
                    sizes="90vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {infoParts.length > 0 && (
              <p className="pointer-events-none absolute bottom-6 left-0 right-0 px-6 text-center text-[12px] tracking-wide text-white/80">
                {infoParts.join(" · ")}
              </p>
            )}
          </motion.div>
        </ModalPortal>
      ) : null}
    </AnimatePresence>
  );
}
