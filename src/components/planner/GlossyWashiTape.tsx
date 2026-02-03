"use client";

import { useRef, useState, useCallback } from "react";

interface GlossyWashiTapeProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "pink" | "blue" | "mint" | "gold";
}

const VARIANTS = {
  pink: {
    bg: "linear-gradient(180deg, rgba(254,202,202,0.95) 0%, rgba(252,165,165,0.98) 100%)",
    border: "1px solid rgba(255,255,255,0.6)",
    shadow: "0 1px 2px rgba(0,0,0,0.15)",
  },
  blue: {
    bg: "linear-gradient(180deg, rgba(191,219,254,0.95) 0%, rgba(147,197,253,0.98) 100%)",
    border: "1px solid rgba(255,255,255,0.6)",
    shadow: "0 1px 2px rgba(0,0,0,0.12)",
  },
  mint: {
    bg: "linear-gradient(180deg, rgba(167,243,208,0.95) 0%, rgba(110,231,183,0.98) 100%)",
    border: "1px solid rgba(255,255,255,0.6)",
    shadow: "0 1px 2px rgba(0,0,0,0.12)",
  },
  gold: {
    bg: "linear-gradient(180deg, rgba(254,240,138,0.95) 0%, rgba(253,224,71,0.98) 100%)",
    border: "1px solid rgba(255,255,255,0.5)",
    shadow: "0 1px 2px rgba(0,0,0,0.18)",
  },
};

/** Fare hareketine duyarlı parlayış + el yırtığı kenarlar */
export function GlossyWashiTape({ className = "", style = {}, variant = "pink" }: GlossyWashiTapeProps) {
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

  const v = VARIANTS[variant];

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        background: v.bg,
        borderTop: v.border,
        boxShadow: v.shadow,
        clipPath: "polygon(0 15%, 5% 0%, 95% 2%, 100% 20%, 98% 85%, 92% 100%, 8% 98%, 0% 80%)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reflective sheen — fare ile hareket eder */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-150"
        style={{
          background: `radial-gradient(circle 40px at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.9) 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}
