"use client";

import { useLayoutEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function BrushStrokeUnderline() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<[number, number]>([0, 180]);
  const { scrollY } = useScroll();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const absTop = rect.top + window.scrollY;
      const vh = window.innerHeight;
      const startAt = Math.max(0, absTop - vh * 0.9);
      const endAt = startAt + Math.max(180, Math.min(320, vh * 0.32));
      rangeRef.current = [startAt, endAt];
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const draw = useTransform(scrollY, (y) => {
    const [startAt, endAt] = rangeRef.current;
    const span = endAt - startAt;
    if (span <= 0) return 0;
    return Math.min(1, Math.max(0, (y - startAt) / span));
  });

  return (
    <div ref={ref} className="mt-1 w-full overflow-visible" aria-hidden>
      <svg
        viewBox="0 0 400 18"
        className="block h-3.5 w-full overflow-visible"
        preserveAspectRatio="none"
        fill="none"
      >
        <motion.path
          d="M4 11 C 52 4, 98 16, 146 8 C 198 1, 242 16, 292 9 C 332 4, 368 14, 396 7"
          stroke="var(--gold)"
          strokeWidth="2.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: reduceMotion ? 1 : draw, opacity: 0.88 }}
        />
        <motion.path
          d="M12 13 C 78 8, 148 16, 218 10 C 288 5, 348 14, 394 10"
          stroke="var(--ink)"
          strokeWidth="1.15"
          strokeLinecap="round"
          style={{ pathLength: reduceMotion ? 1 : draw, opacity: 0.28 }}
        />
      </svg>
    </div>
  );
}
