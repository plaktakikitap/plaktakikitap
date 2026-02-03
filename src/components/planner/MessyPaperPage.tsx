"use client";

interface MessyPaperPageProps {
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
  showCoffeeStain?: boolean;
  showCurledCorner?: boolean;
}

/** SVG noise — kağıt dokusu */
const PAPER_NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/**
 * Hyper-Realistic kağıt — Fiziksel motor:
 * - position: relative + transform-style: preserve-3d ile tüm absolute
 *   (ataş, fotoğraf, not) öğeler sayfa konteynerına sabitlenir.
 * - Flip animasyonu sırasında kağıttan kopuk görünmez.
 * - Hafif sararmış, kahve lekesi, kıvrık köşe.
 */
export function MessyPaperPage({
  children,
  className = "",
  side = "left",
  showCoffeeStain = true,
  showCurledCorner = true,
}: MessyPaperPageProps) {
  const curledRight = side === "right";
  const curledLeft = side === "left";

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        transformStyle: "preserve-3d",
        backgroundColor: "#e8e0d0",
        backgroundImage: [
          "repeating-linear-gradient(transparent, transparent 26px, rgba(0,0,0,0.04) 26px, rgba(0,0,0,0.04) 27px)",
          "linear-gradient(180deg, rgba(220,205,180,0.4) 0%, transparent 20%)",
          "linear-gradient(270deg, rgba(200,185,160,0.2) 0%, transparent 15%)",
          "radial-gradient(ellipse 80% 60% at 70% 95%, rgba(160,120,80,0.06) 0%, transparent 55%)",
        ].join(", "),
        backgroundSize: "auto, 100% 100%, 100% 100%, 100% 100%",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05), inset 1px 1px 0 rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      {/* Kağıt noise overlay — lifli doku hissi */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage: PAPER_NOISE,
          backgroundSize: "96px 96px",
        }}
      />

      {/* Kahve lekesi — hafif sarı-kahverengi lekeler */}
      {showCoffeeStain && (
        <>
          <div
            className="pointer-events-none absolute bottom-[12%] right-[8%] h-28 w-28 rounded-full opacity-[0.08]"
            style={{
              background: "radial-gradient(ellipse 50% 50%, rgba(130,90,55,0.5) 0%, transparent 65%)",
              filter: "blur(12px)",
            }}
          />
          <div
            className="pointer-events-none absolute top-[15%] left-[10%] h-16 w-16 rounded-full opacity-[0.04]"
            style={{
              background: "radial-gradient(ellipse 50% 50%, rgba(140,95,60,0.4) 0%, transparent 60%)",
              filter: "blur(8px)",
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
