"use client";

import { useRef, useState, useCallback } from "react";

interface GlossyWashiTapeProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "pink" | "blue" | "mint" | "gold" | "beige";
  rotateDeg?: number;
}

/** Yarı şeffaf maskeleme bandı — hafif pürüzlü kenarlar */
const VARIANTS = {
  pink: {
    bg: "linear-gradient(180deg, rgba(254,202,202,0.75) 0%, rgba(252,165,165,0.82) 100%)",
    border: "1px solid rgba(255,255,255,0.5)",
    shadow: "0 1px 3px rgba(0,0,0,0.12)",
  },
  blue: {
    bg: "linear-gradient(180deg, rgba(191,219,254,0.75) 0%, rgba(147,197,253,0.82) 100%)",
    border: "1px solid rgba(255,255,255,0.5)",
    shadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  mint: {
    bg: "linear-gradient(180deg, rgba(167,243,208,0.75) 0%, rgba(110,231,183,0.82) 100%)",
    border: "1px solid rgba(255,255,255,0.5)",
    shadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  gold: {
    bg: "linear-gradient(180deg, rgba(254,240,138,0.75) 0%, rgba(253,224,71,0.82) 100%)",
    border: "1px solid rgba(255,255,255,0.45)",
    shadow: "0 1px 3px rgba(0,0,0,0.14)",
  },
  beige: {
    bg: "linear-gradient(180deg, rgba(250,240,220,0.78) 0%, rgba(235,220,195,0.85) 100%)",
    border: "1px solid rgba(255,255,255,0.55)",
    shadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
};

/** El yırtığı kenarlar — pürüzlü, kusursuz kesim değil (çok noktalı polygon) */
const ROUGH_CLIP_PATHS = [
  "polygon(0 8%, 2% 2%, 8% 0%, 18% 1%, 28% 0%, 42% 2%, 55% 0%, 68% 1%, 82% 0%, 94% 3%, 100% 12%, 99% 28%, 100% 45%, 98% 62%, 100% 78%, 96% 92%, 88% 100%, 72% 99%, 52% 100%, 32% 98%, 12% 100%, 2% 95%, 0 82%, 1% 55%, 0 32%)",
  "polygon(1% 15%, 5% 5%, 14% 0%, 26% 2%, 38% 0%, 52% 1%, 66% 0%, 78% 2%, 90% 0%, 98% 8%, 100% 22%, 99% 38%, 100% 55%, 97% 72%, 100% 88%, 92% 100%, 75% 98%, 58% 100%, 40% 97%, 22% 100%, 8% 96%, 0 85%, 2% 65%, 0 42%)",
  "polygon(0 22%, 3% 8%, 12% 2%, 24% 0%, 36% 1%, 50% 0%, 64% 2%, 76% 0%, 88% 3%, 97% 10%, 100% 25%, 98% 42%, 100% 58%, 97% 75%, 100% 90%, 90% 100%, 70% 98%, 48% 100%, 28% 97%, 10% 100%, 0 90%, 2% 70%, 0 48%)",
];

/** Fare hareketine duyarlı parlayış + hafif pürüzlü maskeleme bandı kenarları */
export function GlossyWashiTape({
  className = "",
  style = {},
  variant = "pink",
  rotateDeg = 0,
}: GlossyWashiTapeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shine, setShine] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setShine({ x, y });
    },
    []
  );

  const handleMouseLeave = useCallback(() => setShine({ x: 50, y: 50 }), []);

  const v = VARIANTS[variant] ?? VARIANTS.pink;
  const clipIdx = Math.abs(rotateDeg) % ROUGH_CLIP_PATHS.length;

  return (
    <div
      ref={ref}
      className={`drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)] ${className}`}
      style={{
        ...style,
        background: v.bg,
        borderTop: v.border,
        boxShadow: v.shadow,
        clipPath: ROUGH_CLIP_PATHS[clipIdx] ?? ROUGH_CLIP_PATHS[0],
        ...(rotateDeg && { transform: `rotate(${rotateDeg}deg) ${String(style.transform || "")}`.trim() }),
        position: "relative",
        overflow: "hidden",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reflective sheen — fare hareketine duyarlı parlayış */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-200 ease-out"
        style={{
          background: `radial-gradient(circle 50% at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 35%, transparent 65%)`,
          opacity: 0.6,
        }}
      />
      {/* İkincil ışık — daha yumuşak */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-300 ease-out"
        style={{
          background: `radial-gradient(ellipse 80% 60% at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.4) 0%, transparent 55%)`,
          opacity: 0.5,
        }}
      />
    </div>
  );
}
