"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export type TimelineImage = { url: string; caption?: string };

export type TimelineEntry = {
  id: string;
  year_or_period: string;
  paragraph_text: string;
  associated_images: TimelineImage[];
  order_index: number;
  is_highlight: boolean;
};

/** Deterministik rastgele — Polaroid rotasyonu için */
function seededRotate(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

/** Her polaroid için dağınık açı — görseldeki gibi */
const POLAROID_ROTATIONS = [-28, 12, -15, 24, -8, 18, -22, 6, -19, 14];

/** Bazı polaroidlerde köşede bant görünümü */
function TapeStrip({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const pos: React.CSSProperties =
    corner === "tl"
      ? { top: -4, left: -4 }
      : corner === "tr"
        ? { top: -4, right: -4 }
        : corner === "bl"
          ? { bottom: -4, left: -4 }
          : { bottom: -4, right: -4 };
  return (
    <div
      className="absolute h-5 w-8 opacity-90"
      style={{
        ...pos,
        background: "linear-gradient(135deg, rgba(255,253,240,0.95) 0%, rgba(240,235,220,0.9) 100%)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
        transform: corner.startsWith("b") ? "rotate(-15deg)" : "rotate(15deg)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    />
  );
}

function PolaroidCard({
  url,
  caption,
  index,
  isHighlight,
  showTape,
}: {
  url: string;
  caption?: string;
  index: number;
  isHighlight: boolean;
  showTape?: boolean;
}) {
  const rot = POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length] ?? seededRotate(index, -25, 25);
  const tapeCorner = (["tr", "bl", "br", "tl"] as const)[index % 4];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(212,175,55,0.2)" }}
      className="relative overflow-visible bg-white shadow-[0_4px_16px_rgba(0,0,0,0.2),0_8px_28px_rgba(0,0,0,0.12)] rounded-[2px]"
      className="w-[110px] sm:w-[130px]"
      style={{
        paddingTop: 6,
        paddingLeft: 6,
        paddingRight: 6,
        paddingBottom: 32,
        transform: `rotate(${rot}deg)`,
        transformOrigin: "center center",
      }}
    >
      {showTape && <TapeStrip corner={tapeCorner} />}
      <div className="relative h-20 w-full overflow-hidden sm:h-24" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
        <img src={url} alt="" className="h-full w-full object-cover" />
      </div>
      <p
        className="absolute left-2 right-2 text-center text-[10px] leading-tight"
        style={{
          bottom: 8,
          fontFamily: "var(--font-handwriting), cursive",
          color: "rgba(50,45,40,0.92)",
        }}
      >
        {caption || " "}
      </p>
    </motion.div>
  );
}

/** Polaroidleri metin kutusunun etrafına dağınık yerleştirmek için slotlar (side'a göre yansıtılacak) */
const SCATTER_SLOTS: { top?: string; bottom?: string; left?: string; right?: string; rotate: number }[] = [
  { top: "-5%", right: "-8%", rotate: -28 },
  { top: "25%", right: "-12%", rotate: 12 },
  { bottom: "-5%", left: "-10%", rotate: -15 },
  { bottom: "15%", right: "5%", rotate: 22 },
  { top: "5%", left: "-15%", rotate: -8 },
  { bottom: "0%", right: "-5%", rotate: 18 },
];

function NarrativeBlock({
  entry,
  side,
  index,
}: {
  entry: TimelineEntry;
  side: "left" | "right";
  index: number;
}) {
  const images = entry.associated_images ?? [];
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="relative w-full max-w-[min(100%,720px)] min-h-[200px] md:min-h-[240px] overflow-visible"
    >
      {/* Yazı kutusu — ortada, polaroidler etrafında dağınık */}
      <div
        className={`relative z-10 mx-auto flex min-w-[280px] max-w-[520px] flex-col rounded-xl border p-4 backdrop-blur-md sm:min-w-[380px] md:min-w-[400px] sm:p-5 ${
          entry.is_highlight
            ? "border-amber-500/40 bg-white/10 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
            : "border-white/10 bg-white/5"
        }`}
      >
        <h3 className="text-base font-semibold text-white/95 sm:text-lg">{entry.year_or_period}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/75">
          {entry.paragraph_text}
        </p>
      </div>

      {/* Polaroidler — kenarlarda dağınık açılarla */}
      {images.map((img, i) => {
        const slot = SCATTER_SLOTS[i % SCATTER_SLOTS.length];
        const style: React.CSSProperties = {
          position: "absolute",
          zIndex: 5 + i,
          ...(slot.top !== undefined && { top: slot.top }),
          ...(slot.bottom !== undefined && { bottom: slot.bottom }),
          ...(slot.left !== undefined && { left: slot.left }),
          ...(slot.right !== undefined && { right: slot.right }),
        };
        if (side === "left") {
          if (slot.left !== undefined) {
            style.right = slot.left;
            delete style.left;
          }
          if (slot.right !== undefined) {
            style.left = slot.right;
            delete style.right;
          }
        }
        return (
          <div key={i} className="absolute overflow-visible" style={style}>
            <PolaroidCard
              url={img.url}
              caption={img.caption}
              index={index * 3 + i}
              isHighlight={entry.is_highlight}
              showTape={i % 3 !== 1}
            />
          </div>
        );
      })}
    </motion.div>
  );
}

export function AboutTimeline({ entries }: { entries: TimelineEntry[] }) {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 0.7, 0.9, 0.5]);

  useEffect(() => setMounted(true), []);

  const sorted = [...entries].sort((a, b) => a.order_index - b.order_index);

  if (!mounted || sorted.length === 0) {
    return (
      <div className="py-24 text-center text-white/50">
        {sorted.length === 0 ? "Henüz timeline içeriği yok. Admin panelinden ekleyebilirsiniz." : "Yükleniyor..."}
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-5xl px-3 py-10 sm:px-4 sm:py-16">
      {/* Timeline spine — mobilde solda, masaüstünde ortada */}
      <div className="absolute left-4 top-0 bottom-0 w-px md:left-1/2 md:-translate-x-1/2">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-amber-500/40 to-amber-500/20"
          style={{ opacity: glowOpacity }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(212,175,55,0.15) 20%, rgba(212,175,55,0.25) 50%, rgba(212,175,55,0.15) 80%, transparent 100%)",
            boxShadow: "0 0 12px rgba(212,175,55,0.2)",
          }}
        />
      </div>

      <div className="relative space-y-12 sm:space-y-20">
        {sorted.map((entry, i) => (
          <div
            key={entry.id}
            className="relative grid min-h-[100px] grid-cols-1 items-start gap-0 pl-10 md:min-h-[140px] md:grid-cols-2 md:pl-0"
          >
            {/* Event marker — mobilde spine'ın üstünde, masaüstünde ortada */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.08 + 0.2, type: "spring", stiffness: 300 }}
              className="absolute left-[7px] top-8 z-10 rounded-full border-2 border-amber-500/60 bg-amber-500/90 shadow-[0_0_12px_rgba(212,175,55,0.5)] md:left-1/2 md:top-10 md:-translate-x-1/2"
              style={{
                width: entry.is_highlight ? 14 : 12,
                height: entry.is_highlight ? 14 : 12,
              }}
            />
            {/* Sol sütun (grid col 1): çift index burada — masaüstünde sağa hizalı */}
            <div className="min-w-0 md:flex md:justify-end md:pr-6">
              {i % 2 === 0 && (
                <NarrativeBlock entry={entry} side="right" index={i} />
              )}
            </div>
            {/* Sağ sütun (grid col 2): tek index burada — sola hizalı */}
            <div className="min-w-0 md:flex md:justify-start md:pl-6">
              {i % 2 === 1 && (
                <NarrativeBlock entry={entry} side="left" index={i} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
