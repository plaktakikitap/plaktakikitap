"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { parseYouTubeVideoId } from "@/lib/works-utils";
import type { Video } from "@/types/videos";

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
}

function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function VideoModal({ video, onClose }: VideoModalProps) {
  const videoId = video ? parseYouTubeVideoId(video.youtube_url) : null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = Boolean(video && videoId);

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

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {video && videoId && (
        <motion.div
          key={video.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
            aria-label="Kapat"
          >
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
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                  title={video.title || "YouTube video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
              <div className="flex flex-col gap-3 border-t border-white/10 bg-black/60 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                {video.title ? (
                  <p id="video-modal-title" className="min-w-0 flex-1 text-sm font-medium text-white/95 line-clamp-2">
                    {video.title}
                  </p>
                ) : (
                  <span id="video-modal-title" className="sr-only">Video oynatıcı</span>
                )}
                <a
                  href={getYouTubeWatchUrl(videoId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/15 px-4 py-2.5 text-sm font-medium text-amber-200 shadow-sm transition hover:border-amber-400/50 hover:bg-amber-500/25 hover:text-amber-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  YouTube&apos;da İzle ve Yorum Yap
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
