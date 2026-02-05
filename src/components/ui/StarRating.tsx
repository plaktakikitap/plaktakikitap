"use client";

import { useId } from "react";

const MAX = 5;
const STEP = 0.25;
const OPTIONS = (() => {
  const arr: number[] = [];
  for (let v = 0; v <= MAX; v += STEP) arr.push(Math.round(v * 100) / 100);
  return arr;
})();

/** 5-star row with single filled overlay: filledWidth = (rating / 5) * 100% */
function StarRow({ sizeClass }: { sizeClass: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${sizeClass}`} aria-hidden>
      {"★".repeat(5)}
    </span>
  );
}

interface StarRatingDisplayProps {
  /** 0–5 arası, 0.25 adımlı */
  value: number | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** User UI: 5-star row with one filled overlay (no per-star assets). */
export function StarRatingDisplay({
  value,
  size = "md",
  className = "",
}: StarRatingDisplayProps) {
  const sizeClass =
    size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  const clamped = value != null ? Math.max(0, Math.min(MAX, value)) : 0;
  const filledWidthPercent = (clamped / MAX) * 100;

  return (
    <span
      className={`relative inline-flex ${sizeClass} ${className}`}
      aria-label={value != null ? `${value} / 5 yıldız` : "Puan yok"}
    >
      {/* Background: empty stars */}
      <span className="text-amber-500/30">
        <StarRow sizeClass={sizeClass} />
      </span>
      {/* Filled overlay: clip to (rating/5)*100% */}
      <span
        className="absolute left-0 top-0 overflow-hidden text-amber-400"
        style={{ width: `${filledWidthPercent}%` }}
      >
        <StarRow sizeClass={sizeClass} />
      </span>
    </span>
  );
}

interface StarRatingInputProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Admin: slider (step 0.25) + numeric preview + stepper buttons. */
export function StarRatingInput({
  value,
  onChange,
  name,
  size = "md",
  className = "",
}: StarRatingInputProps) {
  const id = useId();
  const sizeClass =
    size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  const numValue = value ?? 0;

  const step = (delta: number) => {
    const next = numValue + delta;
    if (next <= 0) onChange(null);
    else onChange(Math.round(Math.min(MAX, Math.max(0, next)) * 100) / 100);
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <input
        type="hidden"
        name={name}
        value={value ?? ""}
        readOnly
        aria-hidden
      />
      <span className={`inline-flex ${sizeClass}`} aria-hidden>
        <StarRatingDisplay value={value} size={size} />
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-STEP)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] transition hover:bg-[var(--muted)]"
          aria-label="Puanı azalt"
        >
          −
        </button>
        <span className="min-w-[3rem] text-center tabular-nums text-sm font-medium">
          {value != null ? value.toFixed(2) : "—"}
        </span>
        <button
          type="button"
          onClick={() => step(STEP)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] transition hover:bg-[var(--muted)]"
          aria-label="Puanı artır"
        >
          +
        </button>
      </div>
      <label htmlFor={id} className="sr-only">
        Puan (0–5, 0.25 adım)
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={MAX}
        step={STEP}
        value={value ?? 0}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(v === 0 ? null : v);
        }}
        className="h-2 w-24 flex-shrink-0 rounded-full border-0 bg-[var(--input)] accent-[var(--accent)]"
      />
    </div>
  );
}
