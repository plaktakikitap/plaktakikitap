"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
type Item = { id: string; title: string; youtube_video_id: string };
type Props = { item: Item | null; onClose: () => void };

function watchUrl(videoId: string) {
  return "https://www.youtube.com/watch?v=" + videoId;
}

export function PlaktakiKitapPlayerModal({ item, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = Boolean(item);

  const onKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={item.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pk-modal-title"
      >
        <button ref={closeRef} type="button" onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 focus:ring-2 focus:ring-amber-400/50" aria-label="Kapat">
          <X className="h-5 w-5" />
        </button>
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="overflow-hidden rounded-xl border border-amber-400/20 bg-black shadow-2xl shadow-amber-900/10">
            <div className="aspect-video w-full">
              <iframe
                key={item.id}
                src={"https://www.youtube.com/embed/" + item.youtube_video_id + "?autoplay=1&rel=0"}
                title={item.title || "YouTube"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <div className="flex flex-col gap-3 border-t border-white/10 bg-black/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p id="pk-modal-title" className="min-w-0 flex-1 text-sm font-medium text-white/95 line-clamp-2">{item.title || "Video"}</p>
              <a href={watchUrl(item.youtube_video_id)} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/15 px-4 py-2.5 text-sm font-medium text-amber-200 hover:bg-amber-500/25 hover:text-amber-100 focus:ring-2 focus:ring-amber-400/50">
                <ExternalLink className="h-4 w-4" /> YouTube&apos;da İzle ve Yorum Yap
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
