"use client";

import { useState } from "react";
import { parseSpoilers } from "@/lib/spoiler";

export default function SpoilerText({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const segments = parseSpoilers(content);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <SpoilerBlock key={i} text={seg.text} />
        )
      )}
    </span>
  );
}

function SpoilerBlock({ text }: { text: string }) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return (
      <span className="inline align-baseline">
        <span
          className="cursor-pointer rounded px-1 py-0.5 text-[0.92em] text-ink"
          style={{
            background: "var(--gold-soft)",
            boxShadow: "inset 0 0 0 1px rgba(184, 147, 74, 0.35)",
          }}
          onClick={() => setRevealed(false)}
          title="Gizle"
        >
          {text}
          <button
            type="button"
            className="ml-1.5 text-[0.7rem] font-medium text-gold hover:text-ink"
            aria-label="Spoileri gizle"
            onClick={(e) => {
              e.stopPropagation();
              setRevealed(false);
            }}
          >
            ✕
          </button>
        </span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className="mx-0.5 inline-flex translate-y-px items-center gap-1 rounded border border-ink/10 bg-ink/[0.04] px-2 py-0.5 text-[0.72rem] font-medium tracking-[0.02em] text-ink-muted transition-colors hover:border-gold/40 hover:bg-gold-soft hover:text-ink"
      aria-label="Spoileri göster"
    >
      <span aria-hidden>⚠️</span>
      <span>Spoiler — göster</span>
    </button>
  );
}

export { SpoilerText };
