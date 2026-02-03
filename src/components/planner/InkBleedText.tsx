"use client";

import { useMemo } from "react";

const INK_CHARCOAL = "rgba(54, 69, 79, 0.45)";

/** Kelime indekslerini seç — rastgele kelimeler ve cümle sonları */
function pickWordIndices(text: string, seed: number): Set<number> {
  const tokens = text.split(/(\s+)/);
  const indices = new Set<number>();
  let wordIdx = 0;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/\S/.test(t) && t.length > 1) {
      const hash = (seed * 31 + wordIdx * 7 + t.length) % 100;
      if (hash < 22) indices.add(wordIdx);
      if (/[.!?]$/.test(t) && (hash + 13) % 100 < 28) indices.add(wordIdx);
      wordIdx++;
    }
  }
  return indices;
}

interface InkBleedTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  seed?: number;
}

export function InkBleedText({ text, className = "", style = {}, seed = 0 }: InkBleedTextProps) {
  const parts = useMemo(() => {
    const smudgeWords = pickWordIndices(text, seed);
    const tokens = text.split(/(\s+)/);
    const result: { type: "text" | "smudge"; content: string }[] = [];
    let wordIdx = 0;

    for (const t of tokens) {
      if (/\S/.test(t) && t.length > 1 && smudgeWords.has(wordIdx)) {
        result.push({ type: "smudge", content: t });
        wordIdx++;
      } else {
        if (/\S/.test(t)) wordIdx++;
        result.push({ type: "text", content: t });
      }
    }
    return result;
  }, [text, seed]);

  return (
    <span className={className} style={style}>
      {parts.map((p, idx) =>
        p.type === "smudge" ? (
          <span
            key={idx}
            className="relative inline"
            style={{ fontFamily: "inherit" }}
          >
            {p.content}
            <span
              className="absolute left-0 top-0.5 -z-10 whitespace-nowrap"
              style={{
                color: INK_CHARCOAL,
                filter: "blur(1.8px)",
                opacity: 0.55,
                transform: "translateY(1px) scaleX(1.08)",
              }}
              aria-hidden
            >
              {p.content}
            </span>
          </span>
        ) : (
          <span key={idx}>{p.content}</span>
        )
      )}
    </span>
  );
}
