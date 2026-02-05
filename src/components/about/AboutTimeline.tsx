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

const POLAROID_ROTATIONS = [-30, 8, -12, 22, -18, 5, -25, 15];

function PolaroidCard({
  url,
  caption,
  index,
  isHighlight,
}: {
  url: string;
  caption?: string;
  index: number;
  isHighlight: boolean;
}) {
  const rot = POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length] ?? seededRotate(index, -25, 25);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ scale: 1.08, boxShadow: "0 0 24px rgba(212,175,55,0.35)" }}
      className="relative w-[100px] shrink-0 overflow-hidden rounded-sm bg-white px-1.5 pb-5 pt-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.25),0_8px_32px_rgba(0,0,0,0.15)] sm:w-[140px] sm:px-2 sm:pb-8 sm:pt-2"
      style={{
        transform: `rotate(${rot}deg)`,
        transformOrigin: "center center",
      }}
    >
      <div className="relative h-20 w-full overflow-hidden rounded-sm sm:h-28">
        <img src={url} alt="" className="h-full w-full object-cover" />
      </div>
      {caption && (
        <p
          className="absolute bottom-2 left-2 right-2 text-center text-[10px] leading-tight"
          style={{ fontFamily: "var(--font-handwriting), cursive", color: "rgba(60,50,40,0.9)" }}
        >
          {caption}
        </p>
      )}
    </motion.div>
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
  const images = entry.associated_images ?? [];
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className={`flex w-full max-w-full flex-col gap-4 md:max-w-[calc(50%-48px)] md:flex-row ${
        side === "left" ? "md:flex-row-reverse" : ""
      }`}
    >
      <div
        className={`flex min-w-0 flex-1 flex-col rounded-xl border p-4 backdrop-blur-md sm:p-5 ${
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
      {images.length > 0 && (
        <div
          className={`flex flex-wrap gap-3 ${side === "left" ? "justify-end" : "justify-start"}`}
        >
          {images.map((img, i) => (
            <PolaroidCard
              key={i}
              url={img.url}
              caption={img.caption}
              index={index * 3 + i}
              isHighlight={entry.is_highlight}
            />
          ))}
        </div>
      )}
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
            className="relative flex min-h-[100px] items-start pl-10 md:min-h-[140px] md:justify-between md:pl-0"
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
            {i % 2 === 0 ? (
              <>
                <div className="hidden flex-1 md:block" />
                <div className="flex min-w-0 flex-1 justify-end pl-0 md:pr-12">
                  <NarrativeBlock entry={entry} side="left" index={i} />
                </div>
              </>
            ) : (
              <>
                <div className="flex min-w-0 flex-1 justify-start pl-0 md:pl-12">
                  <NarrativeBlock entry={entry} side="right" index={i} />
                </div>
                <div className="hidden flex-1 md:block" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
