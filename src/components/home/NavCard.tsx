"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { NavCardItem } from "@/components/home/nav-cards";

/** Yuvarlatılmış dikdörtgen — viewBox 0 0 100 100, kart boyutuna responsive ölçeklenir. */
const BORDER_PATH =
  "M 8,1 H 92 Q 99,1 99,8 V 92 Q 99,99 92,99 H 8 Q 1,99 1,92 V 8 Q 1,1 8,1 Z";

function GoldThreadBorder({
  active,
  reduceMotion,
}: {
  active: boolean;
  reduceMotion: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useLayoutEffect(() => {
    const node = pathRef.current;
    if (node) {
      setPathLength(node.getTotalLength());
    }
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
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.45, ease: "easeInOut" }
        }
      />
    </svg>
  );
}

export function NavCard({ card }: { card: NavCardItem }) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const Icon = card.Icon;

  return (
    <Link
      href={card.href}
      className="group relative flex w-full min-h-[156px] flex-col items-center justify-center overflow-hidden rounded-[10px] border border-[rgba(201,166,90,0.15)] bg-[rgba(255,255,255,0.03)] px-7 py-[2.75rem] text-center transition-colors duration-300 hover:bg-[rgba(201,166,90,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a65a]/40"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <GoldThreadBorder active={hovered} reduceMotion={!!reduceMotion} />

      <motion.div
        className="relative z-[1] flex flex-col items-center gap-3.5"
        animate={hovered && !reduceMotion ? { y: -4 } : { y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
      >
        <Icon
          className="h-[30px] w-[30px] shrink-0"
          stroke="#e8dcc0"
          strokeWidth={1.5}
          aria-hidden
        />
        <span className="flex flex-col gap-1">
          <span className="font-sans text-[1.125rem] font-medium leading-snug tracking-tight text-[#f3ead9]">
            {card.title}
          </span>
          {card.subtitle ? (
            <span className="font-sans text-[0.9rem] font-normal leading-snug tracking-wide text-[#9a9488]">
              {card.subtitle}
            </span>
          ) : null}
        </span>
      </motion.div>
    </Link>
  );
}
