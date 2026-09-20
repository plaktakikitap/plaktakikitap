"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  SECTION_NAME,
  SECTION_PATH,
  SECTION_TITLE,
} from "@/lib/karalamalar-section";
import type { Karalama } from "@/lib/karalamalar";

const BORDER_PATH =
  "M 8,1 H 92 Q 99,1 99,8 V 92 Q 99,99 92,99 H 8 Q 1,99 1,92 V 8 Q 1,1 8,1 Z";

function GoldThreadBorder({
  active,
  reduceMotion,
}: {
  active: boolean;
  reduceMotion: boolean | null;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useLayoutEffect(() => {
    const node = pathRef.current;
    if (node) setPathLength(node.getTotalLength());
  }, []);

  const dashReady = pathLength > 0;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        ref={pathRef}
        d={BORDER_PATH}
        fill="none"
        stroke="#c9a65a"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        initial={false}
        animate={{
          strokeDashoffset: active && dashReady ? 0 : pathLength,
          opacity: active ? 1 : 0,
        }}
        style={{ strokeDasharray: dashReady ? pathLength : 1 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.45, ease: "easeInOut" }
        }
      />
    </svg>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function preview(text: string, max = 80): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}...`;
}

function KaralamaCard({ item }: { item: Karalama }) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`${SECTION_PATH}/${item.slug}`}
      className="relative block rounded-xl border border-white/10 bg-white/[0.03] p-5 no-underline transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <GoldThreadBorder active={hovered} reduceMotion={reduceMotion} />
      <h3
        className="relative text-lg text-[#f3ead9]"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        {item.baslik}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-[#9a9488]">
        {preview(item.icerik)}
      </p>
      <time
        dateTime={item.olusturma_tarihi}
        className="relative mt-3 block text-[11px] tracking-wide text-[#9a9488]/70"
      >
        {formatDate(item.olusturma_tarihi)}
      </time>
    </Link>
  );
}

export function KaralamalarHomeSection({ items }: { items: Karalama[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto mt-10 w-full max-w-6xl px-2 sm:mt-14 sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-4 px-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#c9a65a]">
          {SECTION_NAME}
        </p>
        <Link
          href={SECTION_PATH}
          className="text-xs text-[#9a9488] no-underline transition hover:text-[#c9a65a]"
        >
          tümünü gör →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {items.map((item) => (
          <KaralamaCard key={item.id} item={item} />
        ))}
      </div>
      <p className="sr-only">{SECTION_TITLE}</p>
    </section>
  );
}
