"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { PlannerEntryWithMedia, DaySmudge } from "@/lib/planner";
import { InkBleedText } from "./InkBleedText";
import { SmudgeOverlay, type SmudgePreset } from "./SmudgeOverlay";
import { getVideoEmbedUrl } from "@/lib/utils/embed";

export type { DaySmudge };

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
  smudge?: DaySmudge;
  onClose: () => void;
}

/** Insert paper — sağ sayfanın üzerine açılan, defterin arasından çıkan ek kağıt */
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 60% 50%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.45) 100%)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Gün kayıtları"
    >
      {/* Mini Journal Modal — glass + paper: cam blur arka plan, kağıt panel */}
      <motion.div
        ref={containerRef}
        initial={{
          opacity: 0,
          x: -80,
          rotateY: -12,
          scale: 0.96,
          transformOrigin: "left center",
        }}
        animate={{
          opacity: 1,
          x: 0,
          rotateY: 0,
          scale: 1,
          transition: {
            type: "spring",
            damping: 28,
            stiffness: 220,
            mass: 0.9,
          },
        }}
        exit={{
          opacity: 0,
          x: -40,
          rotateY: -8,
          scale: 0.98,
          transition: { duration: 0.18 },
        }}
        className="relative max-h-[88vh] w-full max-w-xl overflow-hidden rounded-xl border border-black/12 border-white/20 bg-[#F3EAD7]/95 shadow-2xl ring-1 ring-white/10"
        style={{
          transformStyle: "preserve-3d",
          perspective: 1200,
          boxShadow:
            "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
          backgroundImage: [
            "repeating-linear-gradient(transparent, transparent 30px, rgba(0,0,0,0.03) 30px, rgba(0,0,0,0.03) 31px)",
            "linear-gradient(rgba(0,0,0,0.02), transparent 20%)",
          ].join(", "),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Yazıyı Dağıt — leke overlay (varsa) */}
        {smudge?.preset && (
          <SmudgeOverlay
            preset={smudge.preset as SmudgePreset}
            x={smudge.x ?? 0.75}
            y={smudge.y ?? 0.3}
            rotation={smudge.rotation ?? 15}
            opacity={(smudge.opacity ?? 0.12) * 0.8}
            style={{ zIndex: 1 }}
          />
        )}

        {/* Sol kenar — defter cilt izi / insert kenarı */}
        <div
          className="absolute left-0 top-0 h-full w-1.5"
          style={{
            background: "linear-gradient(180deg, #b55 0%, #e99 40%, #c66 100%)",
            opacity: 0.7,
            boxShadow: "inset 0 0 4px rgba(0,0,0,0.1)",
          }}
        />

        <div className="relative z-[2] overflow-y-auto pl-7 pr-6 pt-6 pb-10" style={{ maxHeight: "88vh" }}>
          {entries.length === 0 ? (
            <p className="py-12 text-center text-sm text-black/50 font-sans">
              Bu güne henüz not eklenmemiş.
            </p>
          ) : (
            <div className="space-y-8">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="space-y-4 rounded-lg border border-black/6 bg-white/30 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  {entry.title && (
                    <h3 className="text-lg font-semibold text-[#201A14] font-display">
                      {entry.title}
                    </h3>
                  )}
                  {entry.content && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-black/85 font-sans">
                      <InkBleedText text={entry.content} seed={entry.id?.length ?? 0} />
                    </p>
                  )}

                  {/* Büyük fotoğraflar ve videolar — şık hiyerarşi */}
                  {entry.media.length > 0 && (
                    <div className="mt-4 space-y-5">
                      {entry.media.map((m) => (
                        <div key={m.id} className="space-y-2">
                          {m.type === "image" && (
                            <div className="relative w-full overflow-hidden rounded-lg border border-black/10 shadow-[0_2px_12px_rgba(0,0,0,0.1),0_4px_20px_rgba(0,0,0,0.06)]" style={{ maxHeight: 360 }}>
                              <Image
                                src={m.url}
                                alt=""
                                width={800}
                                height={360}
                                className="w-full rounded-lg object-cover"
                                style={{ maxHeight: 360 }}
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8Q/9k="
                                sizes="(max-width: 640px) 100vw, 800px"
                              />
                            </div>
                          )}
                          {m.type === "video" && (() => {
                            const embedUrl = getVideoEmbedUrl(m.url);
                            if (embedUrl) {
                              return (
                                <div className="aspect-video w-full overflow-hidden rounded-lg border border-black/10 shadow-[0_2px_12px_rgba(0,0,0,0.1)]">
                                  <iframe
                                    src={embedUrl}
                                    title="Video"
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              );
                            }
                            return (
                              <a
                                href={m.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-lg border border-black/10 bg-black/5 px-4 py-3 text-sm text-[#2563eb] hover:bg-black/8 hover:underline"
                              >
                                <span className="text-lg">▶</span> Video izle
                              </a>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  )}

                  {entry.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-amber-900/10 px-2.5 py-1 text-xs text-amber-900/75"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {entry.createdAt && (
                    <p className="text-xs text-black/40 font-sans">
                      {formatCreatedAt(entry.createdAt)}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
