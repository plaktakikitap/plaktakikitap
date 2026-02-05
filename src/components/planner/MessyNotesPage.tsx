"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { PlannerDaySummary, AttachmentStyle } from "@/lib/planner";
import { AttachmentSVG } from "./AttachmentSVG";
import { GlossyWashiTape } from "./GlossyWashiTape";

interface CustomField {
  label: string;
  content: string;
}

interface MessyNotesPageProps {
  monthName: string;
  summaries: PlannerDaySummary[];
  onDayClick: (dateStr: string, monthName: string, day: number) => void;
  images?: { url: string; dateStr?: string }[];
  paperclipImages?: { url: string; dateStr?: string }[];
  attachedImages?: { url: string; style: AttachmentStyle }[];
  showWashiTape?: boolean;
  showPolaroid?: boolean;
  customFields?: CustomField[];
}

/** Deterministik rastgele — aynı seed için aynı değer */
function seeded(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const WASHI_VARIANTS = ["pink", "blue", "mint", "gold", "beige"] as const;

/** Sağ sayfa — absolute katmanlar (sayfa konteynerına sabit, flip ile hareket eder) */
export function MessyNotesPage({
  monthName,
  summaries,
  onDayClick,
  images = [],
  paperclipImages = [],
  attachedImages = [],
  showWashiTape = true,
  showPolaroid = true,
  customFields = [],
}: MessyNotesPageProps) {
  const { polaroidTilts, polaroidSkews, washiRotates, noteTilts, noteSkews, attachedPositions, customFieldPositions } = useMemo(() => {
    const polaroidTilts = images.slice(0, 5).map((_, i) => seeded(i + 1, -3, 3));
    const polaroidSkews = images.slice(0, 5).map((_, i) => seeded(i + 2, -1, 1));
    const washiRotates = [12, -8, 18, -5, 22].map((v, i) => seeded(i + 10, -25, 25));
    const noteTilts = summaries.slice(0, 5).map((_, i) => seeded(i + 20, -3, 3));
    const noteSkews = summaries.slice(0, 5).map((_, i) => seeded(i + 25, -1, 1));
    const attachedPositions = (attachedImages.length ? attachedImages : paperclipImages.map((p) => ({ url: p.url, style: "standard_clip" as AttachmentStyle })))
      .slice(0, 4)
      .map((_, i) => ({
        left: 8 + (i % 2) * 42,
        top: 2 + Math.floor(i / 2) * 16,
        rotate: seeded(i + 30, -3, 3),
        skew: seeded(i + 31, -1.5, 1.5),
      }));
    const customFieldPositions = customFields.map((_, i) => ({
      left: 5 + (i % 3) * 35,
      top: 48 + Math.floor(i / 3) * 22,
      rotate: seeded(i + 40, -5, 5),
      skew: seeded(i + 41, -1.5, 1.5),
    }));
    return { polaroidTilts, polaroidSkews, washiRotates, noteTilts, noteSkews, attachedPositions, customFieldPositions };
  }, [images, summaries, attachedImages, paperclipImages, customFields]);

  const attachedList = attachedImages.length
    ? attachedImages
    : paperclipImages.map((p) => ({ url: p.url, style: "standard_clip" as AttachmentStyle }));

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
      {/* Katman 1: Ataşlı görseller — sayfa üst kısmında, flip ile birlikte döner */}
      {attachedList.slice(0, 4).map((img, i) => {
        const pos = attachedPositions[i] ?? { left: 8, top: 2, rotate: 0, skew: 0 };
        return (
          <motion.div
            key={i}
            layout
            className="absolute"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: `rotate(${pos.rotate}deg) skew(${pos.skew ?? 0}deg, ${(pos.skew ?? 0) * 0.5}deg)`,
              transformStyle: "preserve-3d",
              zIndex: 50 + i,
            }}
          >
            {/* Kağıtta ataş ezilmesi — hafif gölge */}
            <div
              className="pointer-events-none absolute -right-2 -top-2 rounded-full opacity-60"
              style={{
                width: 22,
                height: 12,
                background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,0,0,0.08) 0%, transparent 70%)",
                filter: "blur(1px)",
              }}
              aria-hidden
            />
            <div
              className="overflow-hidden rounded border border-black/10 bg-white"
              style={{
                width: 72,
                height: 56,
                boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </div>
            <div
              className="absolute -right-1.5 -top-1.5 z-[50]"
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25)) drop-shadow(0 0 0 1px rgba(0,0,0,0.04))" }}
            >
              <AttachmentSVG style={img.style} size={20} />
            </div>
            {showWashiTape && (
              <GlossyWashiTape
                className="absolute -top-0.5 -right-1 h-2.5 w-6 opacity-40"
                variant="beige"
                rotateDeg={washiRotates[i % washiRotates.length]}
                style={{ zIndex: 1 }}
              />
            )}
          </motion.div>
        );
      })}

      {/* Katman 2: İçerik — başlıklar Permanent Marker, notlar Caveat */}
      <div
        className="absolute inset-0 px-4 pb-4 pt-4"
        style={{
          paddingTop: attachedList.length > 0 ? "24%" : "8%",
          zIndex: 5,
        }}
      >
        <h3
          className="text-2xl font-semibold text-black/85"
          style={{ fontFamily: "var(--font-handwriting-title), cursive", filter: "blur(0.2px)", opacity: 0.9 }}
        >
          {monthName} — Notlar
        </h3>

        <div className="mt-3 space-y-2">
          {summaries.slice(0, 5).map((s, i) => {
            const [, m, day] = s.date.split("-");
            return (
              <motion.button
                key={s.dayId}
                layout
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onDayClick(s.date, monthName, parseInt(day ?? "1", 10))}
                className="w-full text-left rounded-lg border border-black/10 bg-white/50 px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] transition hover:bg-white/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.06)]"
                style={{
                  transform: `rotate(${noteTilts[i] ?? 0}deg) skewX(${noteSkews[i] ?? 0}deg)`,
                  transformOrigin: "top left",
                  fontFamily: "var(--font-handwriting), cursive",
                  filter: "blur(0.2px)",
                  opacity: 0.9,
                }}
              >
                <span className="text-sm font-semibold text-amber-900/80">{day}.{m}</span>
                <span className="ml-2 text-sm text-black/75 line-clamp-1">{s.firstEntryTitle || s.firstEntryContent || "(Not)"}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Katman 2b: Özel alanlar — dağınık düzen (Hayatımın Film Müziği vb.) */}
      {customFields.filter((f) => f.label || f.content).map((f, i) => {
        const pos = customFieldPositions[i] ?? { left: 5, top: 50, rotate: 0, skew: 0 };
        return (
          <motion.div
            key={i}
            layout
            className="absolute rounded-lg border border-black/10 bg-white/60 px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.05)]"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              width: "min(38%, 160px)",
              transform: `rotate(${pos.rotate}deg) skew(${pos.skew ?? 0}deg, ${(pos.skew ?? 0) * 0.3}deg)`,
              transformOrigin: "top left",
              zIndex: 6,
              fontFamily: "var(--font-handwriting), cursive",
            }}
          >
            {f.label && (
              <h4
                className="text-sm font-semibold text-black/80"
                style={{ fontFamily: "var(--font-handwriting-title), cursive", filter: "blur(0.2px)", opacity: 0.9 }}
              >
                {f.label}
              </h4>
            )}
            {f.content && (
              <p className="mt-0.5 whitespace-pre-wrap text-xs text-black/75 line-clamp-3" style={{ filter: "blur(0.2px)", opacity: 0.9 }}>{f.content}</p>
            )}
          </motion.div>
        );
      })}

      {/* Katman 3: Polaroid — absolute, beyaz çerçeve, rastgele -3°..3° eğim */}
      {showPolaroid &&
        images.slice(0, 4).map((img, i) => (
          <motion.div
            key={i}
            layout
            className="absolute"
            style={{
              right: `${6 + i * 12}%`,
              bottom: `${10 + (i % 2) * 8}%`,
              transform: `rotate(${polaroidTilts[i] ?? 0}deg)`,
              transformStyle: "preserve-3d",
              zIndex: 40 + i,
            }}
          >
            <PolaroidFrame
              src={img.url}
              showWashi={showWashiTape}
              washiRotate={washiRotates[i + 2] ?? 15}
              washiVariant={WASHI_VARIANTS[i % WASHI_VARIANTS.length]}
            />
          </motion.div>
        ))}
    </div>
  );
}

function PolaroidFrame({
  src,
  showWashi = false,
  washiRotate = 15,
  washiVariant = "beige",
}: {
  src: string;
  showWashi?: boolean;
  washiRotate?: number;
  washiVariant?: "pink" | "blue" | "mint" | "gold" | "beige";
}) {
  return (
    <div
      className="relative overflow-hidden bg-white shadow-[0_4px_14px_rgba(0,0,0,0.2),0_2px_6px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]"
      style={{
        width: 74,
        padding: "8px 8px 24px 8px",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {showWashi && (
        <GlossyWashiTape
          className="absolute -top-0.5 -right-1.5 h-2.5 w-7 opacity-40"
          variant={washiVariant}
          rotateDeg={washiRotate}
          style={{ zIndex: 2 }}
        />
      )}
      <div className="relative h-16 w-full overflow-hidden rounded-sm">
        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
