"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Hafif asimetrik, el çizimi hissi veren daire path'leri (viewBox 0 0 44 44). */
const HAND_DRAWN_PATHS = [
  "M 5 20 Q 2 5, 20 3 Q 38 1, 40 18 Q 42 35, 22 38 Q 4 40, 5 20",
  "M 6 22 Q 3 8, 22 4 Q 39 2, 41 19 Q 43 34, 24 39 Q 5 41, 6 22",
  "M 4 18 Q 1 6, 18 2 Q 37 0, 42 16 Q 44 33, 21 37 Q 3 39, 4 18",
  "M 7 21 Q 4 7, 21 5 Q 36 3, 39 17 Q 41 32, 23 37 Q 6 39, 7 21",
  "M 5 19 Q 2 4, 19 2 Q 38 0, 41 17 Q 43 34, 20 38 Q 3 40, 5 19",
] as const;

interface HandDrawnCircleOverlayProps {
  active: boolean;
  /** Gün numarası — path varyasyonu için */
  variant?: number;
}

export function HandDrawnCircleOverlay({
  active,
  variant = 0,
}: HandDrawnCircleOverlayProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const reduceMotion = useReducedMotion();
  const d = HAND_DRAWN_PATHS[Math.abs(variant) % HAND_DRAWN_PATHS.length];

  useLayoutEffect(() => {
    const node = pathRef.current;
    if (node) {
      setPathLength(node.getTotalLength());
    }
  }, [d]);

  const dashReady = pathLength > 0;

  return (
    <svg
      className="pointer-events-none absolute inset-[-4px] z-[4] h-[calc(100%+8px)] w-[calc(100%+8px)]"
      viewBox="0 0 44 44"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <motion.path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="#b85c38"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={
          reduceMotion
            ? { opacity: active ? 0.9 : 0 }
            : {
                strokeDashoffset: active && dashReady ? 0 : pathLength,
                opacity: active ? 1 : 0,
              }
        }
        style={{ strokeDasharray: dashReady ? pathLength : 1 }}
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : {
                strokeDashoffset: {
                  duration: active ? 0.5 : 0,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: active ? 0.35 : 0.2,
                },
              }
        }
      />
    </svg>
  );
}
