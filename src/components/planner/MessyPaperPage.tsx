"use client";

interface MessyPaperPageProps {
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
  showCoffeeStain?: boolean;
  showCurledCorner?: boolean;
}

/** Sararmış kağıt, hafif kahve lekesi, kıvrık köşe */
export function MessyPaperPage({
  children,
  className = "",
  side = "left",
  showCoffeeStain = true,
  showCurledCorner = true,
}: MessyPaperPageProps) {
  const curledSide = side === "right" ? "right" : "left";

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        transformStyle: "preserve-3d",
        backgroundColor: "#ebe4d4",
        backgroundImage: [
          "repeating-linear-gradient(transparent, transparent 28px, rgba(0,0,0,0.035) 28px, rgba(0,0,0,0.035) 29px)",
          "linear-gradient(180deg, rgba(210,195,170,0.3) 0%, transparent 15%)",
          "radial-gradient(ellipse 60% 50% at 85% 90%, rgba(180,140,100,0.08) 0%, transparent 50%)",
        ].join(", "),
        backgroundSize: "auto, auto, 100% 100%",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
      }}
    >
      {/* Subtle noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Coffee stain blob - subtle */}
      {showCoffeeStain && (
        <div
          className="pointer-events-none absolute bottom-[8%] right-[5%] h-24 w-24 rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(ellipse 50% 50%, rgba(120,80,50,0.4) 0%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      )}

      {/* Curled corner */}
      {showCurledCorner && curledSide === "right" && (
        <div
          className="pointer-events-none absolute right-0 top-0 h-20 w-20"
          style={{
            background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.06) 55%, rgba(0,0,0,0.1) 62%, transparent 68%)`,
            filter: "blur(0.5px)",
          }}
        />
      )}

      <div className="relative z-10 h-full w-full p-5">{children}</div>
    </div>
  );
}
