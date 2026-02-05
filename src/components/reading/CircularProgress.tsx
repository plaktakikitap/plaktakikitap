"use client";

interface CircularProgressProps {
  /** 0–100 */
  percent: number;
  size?: number;
  strokeWidth?: number;
  /** Metin çemberin ortasında (örn. "%45") */
  centerLabel?: string;
  className?: string;
  /** Merkez etiket için ek class (örn. text-white) */
  centerLabelClassName?: string;
  /** Track (arka) rengi */
  trackColor?: string;
  /** Dolgu rengi */
  fillColor?: string;
}

export function CircularProgress({
  percent,
  size = 120,
  strokeWidth = 8,
  centerLabel,
  className = "",
  centerLabelClassName = "",
  trackColor = "rgba(255,255,255,0.15)",
  fillColor = "var(--accent, #eab308)",
}: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      role="progressbar"
      aria-label={centerLabel ?? `İlerleme: %${Math.round(clamped)}`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      {centerLabel != null && (
        <span
          className={`absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-[var(--foreground)] ${centerLabelClassName}`}
        >
          {centerLabel}
        </span>
      )}
    </div>
  );
}
