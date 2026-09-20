"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { getEraCardTheme, resolveEraKey, type EraKey } from "@/lib/about-era-colors";

export type TimelineImage = { url: string; caption?: string };

export type TimelineEntry = {
  id: string;
  year_or_period: string;
  paragraph_text: string;
  associated_images: TimelineImage[];
  order_index: number;
  is_highlight: boolean;
};

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

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
  showTape,
  side,
  reduceMotion,
}: {
  url: string;
  caption?: string;
  index: number;
  showTape?: boolean;
  /** Sol/sağ: sol -15°, sağ +15° eğim */
  side?: "left" | "right";
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  const baseRot = POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length] ?? seededRotate(index, -25, 25);
  const rot = side === "left" ? -15 : side === "right" ? 15 : baseRot;
  const tapeCorner = (["tr", "bl", "br", "tl"] as const)[index % 4];
  const staggerDelay = side === "left" ? 0.1 : side === "right" ? 0.25 : 0.15;

  const frameStyle: React.CSSProperties = reduceMotion
    ? {
        opacity: isInView ? 1 : 0,
        transition: "opacity 200ms ease-out",
      }
    : {
        opacity: isInView ? 1 : 0,
        transform: isInView ? "scale(1)" : "scale(0.92)",
        transition: `opacity 0.4s ease-out ${staggerDelay}s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${staggerDelay}s`,
      };

  const imageStyle: React.CSSProperties = reduceMotion
    ? {}
    : {
        filter: isInView
          ? "brightness(1) saturate(1) contrast(1)"
          : "brightness(2) saturate(0) contrast(0.3)",
        transition: `filter 1.8s ease-out ${staggerDelay}s`,
      };

  return (
    <div
      style={{
        transform: `rotate(${rot}deg)`,
        transformOrigin: "center center",
      }}
      className="inline-block"
    >
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(212,175,55,0.2)" }}
        className="relative w-[140px] shrink-0 overflow-visible rounded-[2px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.2),0_8px_28px_rgba(0,0,0,0.12)] sm:w-[170px]"
        style={{
          paddingTop: 8,
          paddingLeft: 8,
          paddingRight: 8,
          paddingBottom: 40,
          ...frameStyle,
        }}
      >
        {showTape && <TapeStrip corner={tapeCorner} />}
        <div className="relative h-28 w-full overflow-hidden sm:h-36" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
          <Image
            src={url}
            alt=""
            fill
            className="object-cover"
            sizes="170px"
            style={imageStyle}
          />
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
  column,
  reduceMotion,
  eraKey,
}: {
  entry: TimelineEntry;
  column: "left" | "right";
  reduceMotion: boolean;
  eraKey: EraKey;
}) {
  const enterX = column === "left" ? -40 : 40;
  const cardStyle = getEraCardTheme(eraKey, entry.is_highlight);

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: enterX }}
      whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
      transition={{ duration: 0.6, ease: CARD_EASE }}
      className="relative z-10 w-full max-w-[min(100%,520px)]"
    >
      <motion.div
        initial={false}
        className="flex flex-col rounded-xl border p-3 backdrop-blur-md md:p-5"
        style={cardStyle}
        transition={{ duration: reduceMotion ? 0 : 0.8, ease: CARD_EASE }}
      >
        <h3 className="text-sm font-semibold text-white/95 md:text-lg">{entry.year_or_period}</h3>
        <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-white/75 md:mt-2 md:text-sm">
          {entry.paragraph_text}
        </p>
      </motion.div>
    </motion.div>
  );
}

function MilestoneDot({
  isHighlight,
  reduceMotion,
}: {
  isHighlight: boolean;
  reduceMotion: boolean;
}) {
  const size = isHighlight ? 14 : 12;

  return (
    <motion.div
      initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      whileInView={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-40% 0px -40% 0px" }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: reduceMotion ? 0 : 0.1,
      }}
      className="absolute left-[7px] top-8 z-10 rounded-full border-2 border-amber-500/60 bg-amber-500/90 shadow-[0_0_12px_rgba(212,175,55,0.5)] md:left-1/2 md:top-10 md:-translate-x-1/2"
      style={{ width: size, height: size }}
    />
  );
}

function ContinuingPulse({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="relative inline-block h-3 w-3">
      {!reduceMotion && (
        <motion.div
          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-[#c9a65a]"
          aria-hidden
        />
      )}
      <div
        className="relative z-[1] h-3 w-3 rounded-full bg-[#c9a65a] shadow-[0_0_10px_rgba(201,166,90,0.45)]"
        aria-hidden
      />
    </div>
  );
}

function TimelineContinuing({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20% 0px" }}
      transition={{ duration: 0.8, delay: reduceMotion ? 0 : 0.3, ease: CARD_EASE }}
      className="relative pb-4 pt-8 sm:pt-10"
    >
      <div
        className="absolute left-[7px] top-8 md:left-1/2 md:top-10 md:-translate-x-1/2"
        aria-hidden
      >
        <ContinuingPulse reduceMotion={reduceMotion} />
      </div>
      <p className="pl-8 text-[0.85rem] italic tracking-[0.05em] text-[#9a9488] md:pl-0 md:pt-12 md:text-center">
        hâlâ devam ediyor...
      </p>
    </motion.div>
  );
}

/** Satırın en sol veya en sağında polaroidleri gösterir — masaüstünde; mobilde gizli */
function RowPolaroids({
  images,
  side,
  index,
  reduceMotion,
}: {
  images: TimelineImage[];
  side: "left" | "right";
  index: number;
  reduceMotion: boolean;
}) {
  if (images.length === 0) return null;
  const isLeft = side === "left";
  return (
    <div
      className="pointer-events-none absolute top-0 z-[1] hidden flex-col gap-4 md:pointer-events-auto md:flex"
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
          style={{ marginTop: i * 88 }}
        >
          <PolaroidCard
            url={img.url}
            caption={img.caption}
            index={index * 3 + i}
            showTape={i % 3 !== 1}
            side={side}
            reduceMotion={reduceMotion}
          />
        </div>
      ))}
    </div>
  );
}

/** Mobilde yazı kutusunun altında polaroidleri akışta gösterir */
function InlinePolaroids({
  images,
  index,
  column,
  reduceMotion,
}: {
  images: TimelineImage[];
  index: number;
  column: "left" | "right";
  reduceMotion: boolean;
}) {
  if (images.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-start gap-3 pt-3 md:hidden">
      {images.map((img, i) => (
        <div key={i} className="overflow-visible">
          <PolaroidCard
            url={img.url}
            caption={img.caption}
            index={index * 3 + i}
            showTape={i % 3 !== 1}
            side={column}
            reduceMotion={reduceMotion}
          />
        </div>
      ))}
    </div>
  );
}

export function AboutTimeline({ entries }: { entries: TimelineEntry[] }) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.85", "end 0.15"],
  });

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 0.7, 0.9, 0.5]);

  const sorted = [...entries].sort((a, b) => a.order_index - b.order_index);

  return (
    <div
      ref={timelineRef}
      className="relative mx-auto max-w-5xl overflow-visible px-3 py-10 sm:px-4 sm:py-16"
    >
      {sorted.length === 0 ? (
        <div className="py-24 text-center text-white/50">
          Henüz timeline içeriği yok. Admin panelinden ekleyebilirsiniz.
        </div>
      ) : (
        <>
      {/* Timeline spine — mobilde solda, masaüstünde ortada */}
      <div className="pointer-events-none absolute bottom-0 left-4 top-0 w-0.5 md:left-1/2 md:-translate-x-1/2">
        <div
          className="absolute inset-0 w-0.5"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(212,175,55,0.12) 15%, rgba(212,175,55,0.18) 50%, rgba(212,175,55,0.12) 85%, transparent 100%)",
          }}
          aria-hidden
        />
        {reduceMotion ? (
          <div
            className="absolute left-0 top-0 h-full w-0.5 bg-[#c9a65a]"
            aria-hidden
          />
        ) : (
          <motion.div
            className="absolute left-0 top-0 h-full w-0.5 origin-top bg-[#c9a65a]"
            style={{
              scaleY: lineScale,
              boxShadow: "0 0 10px rgba(201,166,90,0.45)",
            }}
            aria-hidden
          />
        )}
        <motion.div
          className="absolute inset-0 w-0.5"
          style={{
            opacity: glowOpacity,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(212,175,55,0.25) 30%, rgba(212,175,55,0.35) 50%, rgba(212,175,55,0.25) 70%, transparent 100%)",
          }}
          aria-hidden
        />
      </div>

      <div className="relative space-y-12 sm:space-y-20">
        {sorted.map((entry, i) => {
          const column: "left" | "right" = i % 2 === 0 ? "left" : "right";
          const polaroidSide: "left" | "right" = column;
          const eraKey = resolveEraKey(entry.year_or_period);

          return (
            <motion.div
              key={entry.id}
              viewport={{ margin: "-30% 0px -30% 0px" }}
              className="relative grid min-h-[100px] grid-cols-1 items-start gap-0 overflow-visible pl-10 md:min-h-[200px] md:grid-cols-2 md:pl-0"
            >
              <RowPolaroids
                images={entry.associated_images ?? []}
                side={polaroidSide}
                index={i}
                reduceMotion={!!reduceMotion}
              />

              <MilestoneDot
                isHighlight={entry.is_highlight}
                reduceMotion={!!reduceMotion}
              />

              <div className="min-w-0 md:flex md:justify-end md:pl-[180px] md:pr-6">
                {column === "left" && (
                  <>
                    <NarrativeBlock
                      entry={entry}
                      column={column}
                      reduceMotion={!!reduceMotion}
                      eraKey={eraKey}
                    />
                    <InlinePolaroids
                      images={entry.associated_images ?? []}
                      index={i}
                      column={column}
                      reduceMotion={!!reduceMotion}
                    />
                  </>
                )}
              </div>

              <div className="min-w-0 md:flex md:justify-start md:pl-6 md:pr-[180px]">
                {column === "right" && (
                  <>
                    <NarrativeBlock
                      entry={entry}
                      column={column}
                      reduceMotion={!!reduceMotion}
                      eraKey={eraKey}
                    />
                    <InlinePolaroids
                      images={entry.associated_images ?? []}
                      index={i}
                      column={column}
                      reduceMotion={!!reduceMotion}
                    />
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
        <TimelineContinuing reduceMotion={!!reduceMotion} />
      </div>
        </>
      )}
    </div>
  );
}
