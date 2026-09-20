"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Tv } from "lucide-react";
import type { ContentItem, Series } from "@/types/database";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { getSeriesStatusLabel } from "@/lib/utils/series-status";

type SeriesItem = ContentItem & { series: Series | Series[] | null };

function getSeries(d: SeriesItem): Series | null {
  const s = d.series;
  if (!s) return null;
  return Array.isArray(s) ? s[0] ?? null : s;
}

interface SeriesDetailModalProps {
  item: SeriesItem | null;
  onClose: () => void;
}

export function SeriesDetailModal({ item, onClose }: SeriesDetailModalProps) {
  const series = item ? getSeries(item) : null;

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

  if (!item || !series) return null;

  const totalViews = 1 + (series.rewatch_count ?? 0);
  const totalDurationMin =
    series.total_duration_min ??
    (series.episodes_watched ?? 0) * (series.avg_episode_min ?? 0);
  const ratingValue = item.rating != null ? item.rating / 2 : null;
  const statusLabel = getSeriesStatusLabel(series.status ?? null);

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
        aria-labelledby="series-modal-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden
        />

        <motion.div
          initial={{ scale: 0.98, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.98, opacity: 0, y: 12 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="watch-detail-modal relative flex w-full max-w-2xl overflow-hidden rounded-2xl border shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="relative w-[42%] min-w-[140px] shrink-0 sm:min-w-[180px]">
            <div className="flex aspect-[2/3] w-full items-center justify-center overflow-hidden border-r border-cream/10 bg-black/30">
              <Tv className="h-20 w-20 text-cream/30" aria-hidden />
            </div>
          </div>

          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1.5 text-cream/70 transition hover:bg-cream/10 hover:text-cream"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>

            <h2
              id="series-modal-title"
              className="pr-8 font-editorial text-xl font-semibold leading-tight sm:text-2xl"
              style={{ color: "#F5F0E8" }}
            >
              {item.title}
            </h2>

            {series.creator_or_director && (
              <p className="mt-2 text-sm text-cream/80">
                <span className="watch-detail-muted">Yaratıcı / Yönetmen:</span>{" "}
                {series.creator_or_director}
              </p>
            )}

            <div className="mt-3 space-y-1.5 text-sm text-cream/85">
              <p>
                <span className="watch-detail-muted">Sezon:</span>{" "}
                {series.seasons_watched > 0
                  ? `${series.seasons_watched} izlendi`
                  : "—"}
                {series.total_seasons != null &&
                  ` / ${series.total_seasons} toplam`}
              </p>
              <p>
                <span className="watch-detail-muted">Bölüm:</span>{" "}
                {series.episodes_watched}
              </p>
              {series.avg_episode_min != null && series.avg_episode_min > 0 && (
                <p>
                  <span className="watch-detail-muted">Ort. bölüm süresi:</span>{" "}
                  {series.avg_episode_min} dk
                </p>
              )}
              {totalDurationMin > 0 && (
                <p>
                  <span className="watch-detail-muted">Toplam süre:</span>{" "}
                  {totalDurationMin} dk
                </p>
              )}
            </div>

            {ratingValue != null && (
              <div className="mt-3 flex items-center gap-2">
                <span className="watch-detail-muted text-sm">Puan:</span>
                <StarRatingDisplay
                  value={ratingValue}
                  size="lg"
                  className="text-amber-400"
                />
                <span className="text-sm text-cream/60">
                  ({ratingValue} / 5)
                </span>
              </div>
            )}

            {totalViews > 1 && (
              <div className="mt-4">
                <span className="rounded bg-cream/10 px-2 py-1 text-xs font-medium text-cream/80">
                  x{totalViews} izlendi
                </span>
              </div>
            )}

            {statusLabel && (
              <p className="mt-3 text-sm text-cream/70">
                <span className="watch-detail-muted">Durum:</span> {statusLabel}
              </p>
            )}

            {series.review && (
              <div className="mt-4 flex-1 overflow-y-auto pr-1">
                <p className="watch-detail-muted text-xs font-semibold uppercase tracking-wider">
                  Yorum
                </p>
                <p
                  className="watch-detail-body mt-1.5 text-sm"
                  style={{ lineHeight: 1.6, color: "#F5F0E8" }}
                >
                  {series.review}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </ModalPortal>
  );
}
