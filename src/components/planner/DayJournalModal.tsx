"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { PlannerEntryWithMedia } from "@/lib/planner";

function formatDateTR(day: number, monthName: string, year: number) {
  return `${day} ${monthName} ${year}`;
}

function formatCreatedAt(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DayJournalModalProps {
  day: number;
  monthName: string;
  year: number;
  entries: PlannerEntryWithMedia[];
  onClose: () => void;
}

export function DayJournalModal({
  day,
  monthName,
  year,
  entries,
  smudge,
  onClose,
}: DayJournalModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0] as HTMLElement | undefined;
    const last = focusable[focusable.length - 1] as HTMLElement | undefined;
    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, []);

  const headerLabel = formatDateTR(day, monthName, year);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-modal-title"
    >
      {/* Insert paper — defterin arasından çıkıyormuş animasyonu */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 40, rotateX: -8, transformPerspective: 800 }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: {
            type: "spring",
            damping: 25,
            stiffness: 200,
          },
        }}
        exit={{
          opacity: 0,
          y: 20,
          rotateX: 5,
          transition: { duration: 0.2 },
        }}
        className="relative max-h-[85vh] w-full max-w-lg overflow-hidden rounded-sm border border-black/20 bg-[#F3EAD7] shadow-2xl"
        style={{
          transformStyle: "preserve-3d",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)",
          backgroundImage: [
            "repeating-linear-gradient(transparent, transparent 30px, rgba(0,0,0,0.04) 30px, rgba(0,0,0,0.04) 31px)",
            "linear-gradient(rgba(0,0,0,0.02), transparent)",
          ].join(", "),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sol margin line — bullet journal */}
        <div
          className="absolute left-0 top-0 h-full w-1"
          style={{
            background: "linear-gradient(180deg, #c44 0%, #e88 50%, #c44 100%)",
            opacity: 0.6,
          }}
        />

        <div className="relative z-[2] overflow-y-auto pl-6 pr-6 pt-6 pb-8" style={{ maxHeight: "85vh" }}>
          <div className="mb-6 flex items-center justify-between">
            <h2
              id="day-modal-title"
              className="text-xl font-semibold text-[#201A14]"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              {headerLabel}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-black/50 transition hover:bg-black/5 hover:text-black/70"
              aria-label="Kapat"
            >
              ×
            </button>
          </div>

          {entries.length === 0 ? (
            <p
              className="py-8 text-center text-sm text-black/50"
              style={{ fontFamily: "var(--font-sans), sans-serif" }}
            >
              Bu güne henüz not eklenmemiş.
            </p>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-black/8 bg-white/40 p-4"
                >
                  {entry.title && (
                    <h3
                      className="mb-2 font-semibold text-[#201A14]"
                      style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                    >
                      {entry.title}
                    </h3>
                  )}
                  {entry.content && (
                    <p
                      className="whitespace-pre-wrap text-sm leading-relaxed text-black/85"
                      style={{ fontFamily: "var(--font-handwriting), var(--font-sans), sans-serif" }}
                    >
                      <InkBleedText text={entry.content} seed={entry.id?.length ?? 0} />
                    </p>
                  )}
                  {entry.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-black/8 px-2 py-0.5 text-xs text-black/65"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {entry.media.length > 0 && (
                    <div className="mt-3 flex flex-col gap-4">
                      {entry.media.map((m) => (
                        <div key={m.id} className="space-y-1">
                          {m.type === "image" && (
                            <img
                              src={m.url}
                              alt=""
                              className="max-h-64 w-full rounded-lg border border-black/10 object-cover shadow-sm"
                            />
                          )}
                          {m.type === "video" && (
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-sm text-blue-700 hover:underline"
                            >
                              Video →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {entry.createdAt && (
                    <p
                      className="mt-3 text-xs text-black/45"
                      style={{ fontFamily: "var(--font-sans), sans-serif" }}
                    >
                      {formatCreatedAt(entry.createdAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
