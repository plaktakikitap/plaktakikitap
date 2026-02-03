"use client";

import { motion } from "framer-motion";
import type { PlannerDaySummary, AttachmentStyle } from "@/lib/planner";
import { AttachmentSVG } from "./AttachmentSVG";
import { GlossyWashiTape } from "./GlossyWashiTape";

interface MessyNotesPageProps {
  monthName: string;
  summaries: PlannerDaySummary[];
  onDayClick: (dateStr: string, monthName: string, day: number) => void;
  images?: { url: string; dateStr?: string }[];
  paperclipImages?: { url: string; dateStr?: string }[];
  attachedImages?: { url: string; style: AttachmentStyle }[];
  showWashiTape?: boolean;
  showPolaroid?: boolean;
}

/** Sağ sayfa — dağınık düzen, Polaroid, washi tape, ataşlı görseller */
export function MessyNotesPage({
  monthName,
  summaries,
  onDayClick,
  images = [],
  paperclipImages = [],
  attachedImages = [],
  showWashiTape = true,
  showPolaroid = true,
}: MessyNotesPageProps) {
  const tilts = [-1.5, 2, -2.5, 1, 3];

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
      {/* Ataşlı görseller — sayfa üst kısmında, inset shadow (kağıda baskı) ile */}
      {(attachedImages.length > 0 || paperclipImages.length > 0) && (
        <div className="absolute left-4 right-4 top-3 flex flex-wrap gap-2" style={{ zIndex: 10 }}>
          {(attachedImages.length ? attachedImages : paperclipImages.map((p) => ({ url: p.url, style: "standard_clip" as AttachmentStyle })))
            .slice(0, 3)
            .map((img, i) => (
              <div
                key={i}
                className="relative"
                style={{
                  transform: `rotate(${-3 + i * 2}deg)`,
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15)) drop-shadow(0 2px 4px rgba(0,0,0,0.08))",
                }}
              >
                <div
                  className="overflow-hidden rounded border border-black/10 bg-white shadow-sm"
                  style={{
                    width: 72,
                    height: 56,
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.12), inset 0 -1px 2px rgba(0,0,0,0.06)",
                  }}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </div>
                <div
                  className="absolute -right-1 -top-1 flex items-center justify-center"
                  style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))" }}
                >
                  <AttachmentSVG style={img.style} size={20} />
                </div>
              </div>
            ))}
        </div>
      )}

      <div
        className="px-4 pb-4 pt-2"
        style={{
          fontFamily: "var(--font-handwriting), cursive",
          paddingTop: attachedImages.length > 0 || paperclipImages.length > 0 ? 72 : 8,
        }}
      >
        <h3 className="text-2xl font-semibold text-black/85">
          {monthName} — Notlar
        </h3>

        {/* Dağınık layout */}
        <div className="mt-4 space-y-4">
          {summaries.slice(0, 5).map((s, i) => {
            const [y, m, day] = s.date.split("-");
            return (
              <motion.button
                key={s.dayId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() =>
                  onDayClick(s.date, monthName, parseInt(day ?? "1", 10))
                }
                className="w-full text-left rounded-lg border border-black/10 bg-white/40 px-3 py-2 shadow-sm transition hover:bg-white/70 hover:shadow-md"
                style={{
                  transform: `rotate(${tilts[i] ?? 0}deg)`,
                  transformOrigin: "top left",
                }}
              >
                <span className="text-sm font-semibold text-amber-900/80">
                  {day}.{m}
                </span>
                <span className="ml-2 text-sm text-black/75 line-clamp-1">
                  {s.firstEntryTitle || s.firstEntryContent || "(Not)"}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Hayatımın Film Müziği - placeholder */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-black/75">
            Hayatımın Film Müziği
          </h4>
          <div className="mt-2 h-16 rounded-lg border border-dashed border-black/15 bg-white/20" />
        </div>
      </div>

      {/* Polaroid fotoğraflar - absolute, dağınık */}
      {showPolaroid &&
        images.slice(0, 3).map((img, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              right: 8 + i * 14,
              bottom: 16 + i * 6,
              transform: `rotate(${-3 + i * 4}deg)`,
              zIndex: 5 + i,
            }}
          >
            <PolaroidFrame
              src={img.url}
              showWashi={showWashiTape && i === 0}
            />
          </div>
        ))}
    </div>
  );
}

function PolaroidFrame({
  src,
  showWashi = false,
}: {
  src: string;
  showWashi?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-sm bg-white px-2 pb-2 pt-2 shadow-lg"
      style={{
        width: 72,
        border: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {showWashi && (
        <GlossyWashiTape
          className="absolute -top-1 -right-2 h-3 w-8 opacity-95"
          style={{ transform: "rotate(15deg)", zIndex: 1 }}
        />
      )}
      <div className="relative h-14 w-full overflow-hidden rounded-[2px]">
        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
