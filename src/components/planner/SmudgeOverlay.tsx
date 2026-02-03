"use client";

export type SmudgePreset = "fingerprint" | "smudge_blob" | "smudge_stain" | "ink_bleed";

/** Midnight Blue / Charcoal Black — el yazısı fontuyla uyumlu */
const INK_MIDNIGHT_BLUE = "#191970";
const INK_CHARCOAL_BLACK = "#36454F";

interface SmudgeOverlayProps {
  preset: SmudgePreset;
  x?: number;
  y?: number;
  rotation?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Leke veya parmak izi overlay — sayfa ile birlikte hareket eder (z-index sabit) */
export function SmudgeOverlay({
  preset,
  x = 0.3,
  y = 0.5,
  rotation = 0,
  opacity = 0.15,
  className = "",
  style = {},
}: SmudgeOverlayProps) {
  const fill = INK_CHARCOAL_BLACK;

  const svgContent = {
    fingerprint: (
      <path
        d="M12 4c-2 1-3 4-3 7 0 2 1 4 2 5 1 1 2 2 3 2 1 0 2-1 3-2 1-1 2-3 2-5 0-3-1-6-3-7-1 2-2 4-2 7 0 3 1 5 3 6 2 1 4 1 6 0 2-1 3-3 3-6 0-3-1-5-2-7z"
        fill={fill}
        fillOpacity="0.6"
      />
    ),
    smudge_blob: (
      <ellipse cx="12" cy="12" rx="10" ry="8" fill={fill} transform="rotate(-15 12 12)" />
    ),
    smudge_stain: (
      <path
        d="M6 8Q8 4 12 6Q16 8 18 10Q20 14 16 16Q12 18 8 16Q4 14 6 8z"
        fill={fill}
        fillOpacity="0.7"
      />
    ),
    ink_bleed: (
      <path
        d="M4 10C6 6 10 4 14 6C18 8 20 12 18 16C16 20 10 22 6 18C2 14 2 12 4 10Z"
        fill={INK_MIDNIGHT_BLUE}
        fillOpacity="0.5"
      />
    ),
  };

  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: 80,
        height: 60,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        opacity,
        filter: "blur(2px)",
        zIndex: 1,
        ...style,
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        {svgContent[preset]}
      </svg>
    </div>
  );
}
