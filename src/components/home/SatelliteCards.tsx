"use client";

import { motion } from "framer-motion";

const SATELLITES = [
  {
    id: "vinyl",
    glyph: "◎",
    style: { top: "6%", left: "-14%" },
    scatter: { x: -22, y: -14 },
  },
  {
    id: "book",
    glyph: "▣",
    style: { top: "74%", left: "106%" },
    scatter: { x: 26, y: 10 },
  },
  {
    id: "note",
    glyph: "✎",
    style: { top: "-10%", left: "76%" },
    scatter: { x: 16, y: -22 },
  },
] as const;

interface SatelliteCardsProps {
  active: boolean;
  hovered: boolean;
}

export function SatelliteCards({ active, hovered }: SatelliteCardsProps) {
  if (!active) return null;

  return (
    <>
      {SATELLITES.map((card) => (
        <motion.div
          key={card.id}
          className="pointer-events-none absolute z-20 flex h-9 w-9 items-center justify-center rounded-md border border-[#c9a65a]/25 bg-[#1a1714]/75 font-sans text-[11px] text-[#c9a65a]/75 shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-[2px]"
          style={card.style}
          animate={{
            x: hovered ? card.scatter.x : 0,
            y: hovered ? card.scatter.y : 0,
            opacity: hovered ? 0.95 : 0.5,
            scale: hovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          {card.glyph}
        </motion.div>
      ))}
    </>
  );
}
