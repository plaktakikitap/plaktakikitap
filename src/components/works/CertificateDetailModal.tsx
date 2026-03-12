"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, Award } from "lucide-react";
import type { WorksItem } from "@/types/works";
import { ModalPortal } from "@/components/ui/ModalPortal";

interface CertificateDetailModalProps {
  item: WorksItem | null;
  onClose: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function CertificateDetailModal({ item, onClose }: CertificateDetailModalProps) {
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

  if (!item) return null;

  const linkUrl = item.url || item.external_url;
  const issuer = item.meta && typeof item.meta.issuer === "string" ? item.meta.issuer : null;
  const year = item.meta && typeof item.meta.year !== "undefined" ? String(item.meta.year) : null;
  const description = item.description?.trim() ?? "";
  const dateObtained = year || (item.created_at ? formatDate(item.created_at) : null);

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
      aria-labelledby="cert-modal-title"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/[0.08] shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:flex-row"
      >
        {/* Sol: görsel */}
        <div className="flex shrink-0 items-center justify-center bg-white/5 p-6 sm:w-[45%]">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt=""
              className="max-h-52 max-w-full object-contain sm:max-h-64"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-amber-500/10 text-5xl sm:h-40 sm:w-40">
              <Award className="h-16 w-16 text-amber-400/60" aria-hidden />
            </div>
          )}
        </div>

        {/* Sağ: içerik */}
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
            id="cert-modal-title"
            className="pr-8 font-editorial text-xl font-semibold leading-tight text-white sm:text-2xl"
          >
            {item.title}
          </h2>

          {issuer && (
            <p className="mt-2 text-sm text-white/80">
              <span className="text-white/50">Veren kurum:</span> {issuer}
            </p>
          )}

          {dateObtained && (
            <p className="mt-1 text-sm text-white/80">
              <span className="text-white/50">Tarih:</span> {dateObtained}
            </p>
          )}

          {description ? (
            <div className="mt-4 flex-1 overflow-y-auto pr-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Açıklama
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/90 whitespace-pre-wrap">
                {description}
              </p>
            </div>
          ) : null}

          {linkUrl && (
            <a
              href={linkUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 self-start rounded-lg border border-amber-400/40 bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/30 hover:text-amber-100"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Siteye git
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
    </ModalPortal>
  );
}
