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
  side,
}: {
  url: string;
  caption?: string;
  index: number;
  isHighlight: boolean;
  showTape?: boolean;
  /** Sol/sağ: sol -15°, sağ +15° eğim */
  side?: "left" | "right";
}) {
  const baseRot = POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length] ?? seededRotate(index, -25, 25);
  const rot = side === "left" ? -15 : side === "right" ? 15 : baseRot;
  const tapeCorner = (["tr", "bl", "br", "tl"] as const)[index % 4];
  return (
    <div
      style={{
        transform: `rotate(${rot}deg)`,
        transformOrigin: "center center",
      }}
      className="inline-block"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.45 }}
        whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(212,175,55,0.2)" }}
        className="relative w-[140px] shrink-0 overflow-visible rounded-[2px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.2),0_8px_28px_rgba(0,0,0,0.12)] sm:w-[170px]"
        style={{
          paddingTop: 8,
          paddingLeft: 8,
          paddingRight: 8,
          paddingBottom: 40,
        }}
      >
        {showTape && <TapeStrip corner={tapeCorner} />}
        <div className="relative h-28 w-full overflow-hidden sm:h-36" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
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
    </div>
  );
}

function NarrativeBlock({
  entry,
  side,
  index,
}: {
  entry: TimelineEntry;
  side: "left" | "right";
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="relative z-10 w-full max-w-[min(100%,520px)]"
    >
      {/* Sadece yazı kutusu — polaroidler satırda en sol/sağda */}
      <div
        className={`flex flex-col rounded-xl border p-4 backdrop-blur-md sm:p-5 ${
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
    </motion.div>
  );
}

/** Satırın en sol veya en sağında polaroidleri gösterir — yazıların ötesinde, üstlerini kapatmaz */
function RowPolaroids({
  images,
  side,
  index,
}: {
  images: TimelineImage[];
  side: "left" | "right";
  index: number;
}) {
  if (images.length === 0) return null;
  const isLeft = side === "left";
  return (
    <div
      className="pointer-events-none absolute top-0 z-[1] flex flex-col gap-4 md:pointer-events-auto"
      style={{
        left: isLeft ? "-0.25rem" : undefined,
        right: isLeft ? undefined : "-0.25rem",
        paddingLeft: isLeft ? 0 : undefined,
        paddingRight: isLeft ? undefined : 0,
      }}
    >
      {images.map((img, i) => (
        <div
          key={i}
          className="overflow-visible"
        style={{
          marginTop: i * 88,
        }}
        >
          <PolaroidCard
            url={img.url}
            caption={img.caption}
            index={index * 3 + i}
            isHighlight={false}
            showTape={i % 3 !== 1}
            side={side}
          />
        </div>
      ))}
    </div>
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
    <div className="relative mx-auto max-w-5xl overflow-visible px-3 py-10 sm:px-4 sm:py-16">
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
            className="relative grid min-h-[100px] grid-cols-1 items-start gap-0 overflow-visible pl-10 md:min-h-[200px] md:grid-cols-2 md:pl-0"
          >
            {/* Polaroidler — sitenin EN SOLunda (sol entry) veya EN SAĞında (sağ entry), yazıların ötesinde */}
            <RowPolaroids
              images={entry.associated_images ?? []}
              side={i % 2 === 0 ? "left" : "right"}
              index={i}
            />
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
            {/* Sol sütun: yazı kutucuğu; solda polaroid alanı için padding ile yazı dışarıda kalır */}
            <div className="min-w-0 md:flex md:justify-end md:pl-[180px] md:pr-6">
              {i % 2 === 0 && (
                <NarrativeBlock entry={entry} side="right" index={i} />
              )}
            </div>
            {/* Sağ sütun: yazı kutucuğu; sağda polaroid alanı için padding ile yazı dışarıda kalır */}
            <div className="min-w-0 md:flex md:justify-start md:pl-6 md:pr-[180px]">
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
