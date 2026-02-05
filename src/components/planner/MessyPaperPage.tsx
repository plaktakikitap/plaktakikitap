"use client";

import { useMemo } from "react";
import { AttachmentSVG } from "./AttachmentSVG";
import { GlossyWashiTape } from "./GlossyWashiTape";

interface MessyPaperPageProps {
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
  showCoffeeStain?: boolean;
  showCurledCorner?: boolean;
  /** Sol sayfa (takvim): gün polaroid’leri köşeden taşabilsin; kabuk keser */
  overflowVisible?: boolean;
}

/** Deterministik rastgele */
function seeded(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

/** Old paper — sarımtırak, dokulu kağıt (fractal noise) */
const OLD_PAPER_NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/**
 * Fiziksel sayfa: hafif sarımtırak, dokulu arka plan.
 * (Kağıt yığını gölgesi kaldırıldı — beyaz yığın artefaktı yok.)
 */
export function MessyPaperPage({
  children,
  className = "",
  side = "left",
  showCoffeeStain = true,
  showCurledCorner = true,
  overflowVisible = false,
}: MessyPaperPageProps) {
  const curledRight = side === "right";
  const curledLeft = side === "left";

  /* Kenardan taşan metal ataş ve washi — sayfa başına sabit pozisyonlar */
  const { paperclipEdge, washiEdge } = useMemo(() => {
    const seed = side === "left" ? 1 : 2;
    return {
      paperclipEdge: { left: side === "left" ? undefined : undefined, right: side === "right" ? undefined : undefined, top: `${seeded(seed, 18, 28)}%`, rotate: seeded(seed + 1, -8, 8) },
      washiEdge: { top: `${seeded(seed + 2, 8, 14)}%`, right: side === "right" ? undefined : undefined, left: side === "left" ? undefined : undefined, rotate: seeded(seed + 3, -18, 18) },
    };
  }, [side]);

  return (
    <div
      className={`relative h-full w-full ${overflowVisible ? "overflow-visible" : "overflow-hidden"} ${className}`}
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        backgroundColor: "#e6dcc8",
        backgroundImage: [
          "repeating-linear-gradient(transparent, transparent 26px, rgba(0,0,0,0.035) 26px, rgba(0,0,0,0.035) 27px)",
          "linear-gradient(180deg, rgba(235,220,195,0.5) 0%, transparent 25%)",
          "linear-gradient(270deg, rgba(210,195,165,0.25) 0%, transparent 18%)",
          "radial-gradient(ellipse 80% 60% at 70% 95%, rgba(165,125,85,0.08) 0%, transparent 55%)",
          OLD_PAPER_NOISE,
        ].join(", "),
        backgroundBlendMode: "normal, normal, normal, normal, overlay",
        backgroundSize: "auto, 100% 100%, 100% 100%, 100% 100%, 80px 80px",
        boxShadow: [
          "inset 0 0 0 1px rgba(0,0,0,0.06)",
          "inset 1px 1px 0 rgba(255,255,255,0.4)",
        ].join(", "),
      }}
    >
      {/* Kağıt dokusu overlay — lifli / eski kağıt hissi */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply"
        style={{
          backgroundImage: OLD_PAPER_NOISE,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Metal ataş — sayfa kenarında / kenarından taşan illüzyonu, absolute */}
      <div
        className="pointer-events-none absolute z-[60]"
        style={{
          ...(side === "left" ? { left: 0, transform: `translateX(-45%) rotate(${paperclipEdge.rotate}deg)` } : { right: 0, transform: `translateX(45%) rotate(${paperclipEdge.rotate}deg)` }),
          top: paperclipEdge.top,
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
        }}
      >
        <AttachmentSVG style="standard_clip" size={28} />
      </div>
      {/* Washi tape — yarı şeffaf bant, kenar boyunca */}
      <div
        className="pointer-events-none absolute z-[55]"
        style={{
          ...(side === "left" ? { left: 0 } : { right: 0 }),
          top: washiEdge.top,
          transform: `rotate(${washiEdge.rotate}deg)`,
          width: 28,
          height: 12,
        }}
      >
        <GlossyWashiTape variant="pink" rotateDeg={washiEdge.rotate} className="h-full w-full opacity-80" />
      </div>

      {/* Kahve lekesi — rastgele bölgelerde opacity 0.2 overlay (coffee-stain.png veya SVG fallback) */}
      {showCoffeeStain && (
        <>
          <div
            className="pointer-events-none absolute bottom-[12%] right-[8%] h-28 w-28 rounded-full opacity-20"
            style={{
              background: "radial-gradient(ellipse 50% 50%, rgba(130,90,55,0.7) 0%, transparent 65%)",
              filter: "blur(12px)",
            }}
          />
          <div
            className="pointer-events-none absolute top-[15%] left-[10%] h-16 w-16 rounded-full opacity-20"
            style={{
              background: "radial-gradient(ellipse 50% 50%, rgba(140,95,60,0.6) 0%, transparent 60%)",
              filter: "blur(8px)",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-[8%] right-[4%] h-24 w-24 rounded-full opacity-20"
            style={{
              background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(120,80,50,0.6) 0%, rgba(100,65,40,0.2) 40%, transparent 70%)",
              filter: "blur(6px)",
            }}
          />
          <div
            className="pointer-events-none absolute left-[6%] top-[18%] h-20 w-20 rounded-full opacity-20"
            style={{
              background: "radial-gradient(ellipse 55% 50% at 50% 50%, rgba(130,85,55,0.55) 0%, transparent 65%)",
              filter: "blur(5px)",
            }}
          />
        </>
      )}

      {/* Kıvrık köşe — sağ üst (sağ sayfa), skew ile hafif eğim */}
      {showCurledCorner && curledRight && (
        <div
          className="pointer-events-none absolute right-0 top-0 h-24 w-24 -skew-x-3 skew-y-1 shadow-[2px_-2px_6px_rgba(0,0,0,0.04)]"
          style={{
            background: `linear-gradient(135deg, transparent 45%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.08) 58%, rgba(0,0,0,0.12) 65%, transparent 72%)`,
            filter: "blur(0.3px)",
            clipPath: "polygon(100% 0, 100% 100%, 0 0)",
          }}
        />
      )}

      {/* Kıvrık köşe — sol üst (sol sayfa, takvim) */}
      {showCurledCorner && curledLeft && (
        <div
          className="pointer-events-none absolute left-0 top-0 h-20 w-20 skew-x-2 -skew-y-1 shadow-[-2px_-2px_6px_rgba(0,0,0,0.04)]"
          style={{
            background: `linear-gradient(225deg, transparent 45%, rgba(0,0,0,0.04) 52%, rgba(0,0,0,0.08) 60%, transparent 68%)`,
            filter: "blur(0.3px)",
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
      )}

      <div className="relative z-10 h-full w-full p-4 sm:p-5">{children}</div>
    </div>
  );
}
