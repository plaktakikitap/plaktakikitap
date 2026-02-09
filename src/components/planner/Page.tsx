"use client";

const PAPER_BG = "#fdfaf3";

interface PageProps {
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}

/**
 * One page template: old paper texture + faint dots/lines.
 * Internal pages only (not cover).
 */
export function Page({ children, side = "left", className = "" }: PageProps) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${side === "left" ? "rounded-r-none" : "rounded-l-none"} ${className}`}
      style={{
        backgroundColor: PAPER_BG,
        boxSizing: "border-box",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        backgroundImage: `
          repeating-linear-gradient(transparent, transparent 26px, rgba(0,0,0,0.03) 26px, rgba(0,0,0,0.03) 27px),
          linear-gradient(180deg, rgba(248,240,220,0.5) 0%, transparent 20%, transparent 80%, rgba(225,210,180,0.4) 100%),
          radial-gradient(ellipse 70% 50% at 75% 90%, rgba(180,155,120,0.06) 0%, transparent 60%)
        `,
        boxShadow: side === "right" ? "inset 1px 0 0 rgba(0,0,0,0.06)" : undefined,
      }}
    >
      {children}
    </div>
  );
}
