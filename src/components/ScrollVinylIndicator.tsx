"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";

function ScrollVinylSvg() {
  const uid = useId().replace(/:/g, "");
  const faceId = `svi-face-${uid}`;
  const labelId = `svi-label-${uid}`;

  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden
      className="h-full w-full"
    >
      <defs>
        <radialGradient id={faceId} cx="36%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#2e2e2e" />
          <stop offset="50%" stopColor="#111111" />
          <stop offset="100%" stopColor="#050505" />
        </radialGradient>
        <radialGradient id={labelId} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e2c878" />
          <stop offset="55%" stopColor="#c9a65a" />
          <stop offset="100%" stopColor="#8a6d32" />
        </radialGradient>
      </defs>
      <circle
        cx="24"
        cy="24"
        r="22"
        fill={`url(#${faceId})`}
        stroke="#1a1a1a"
        strokeWidth="0.6"
      />
      {[20, 17.5, 15, 12.5, 10].map((r) => (
        <circle
          key={r}
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.45"
        />
      ))}
      <circle cx="24" cy="24" r="8.5" fill={`url(#${labelId})`} />
      <circle
        cx="24"
        cy="24"
        r="1.6"
        fill="#0a0908"
        stroke="#f3ebdd"
        strokeWidth="0.5"
      />
      <ellipse
        cx="18.5"
        cy="17"
        rx="5.5"
        ry="3"
        fill="rgba(255,255,255,0.08)"
        transform="rotate(-24 24 24)"
      />
    </svg>
  );
}

export function ScrollVinylIndicator() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const rafRef = useRef<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [visible, setVisible] = useState(false);

  const measureScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress =
      maxScroll <= 0 ? 0 : Math.min(1, Math.max(0, scrollTop / maxScroll));

    setRotation(progress * 360);
    setVisible(scrollTop > 50);
    rafRef.current = null;
  }, []);

  const scheduleMeasure = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(measureScroll);
  }, [measureScroll]);

  useEffect(() => {
    scheduleMeasure();

    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [pathname, scheduleMeasure]);

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-50 transition-opacity duration-300 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden={!visible}
    >
      <div
        className="h-9 w-9 sm:h-12 sm:w-12"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: reduceMotion ? "none" : "transform 0.12s linear",
          filter:
            "drop-shadow(0 2px 8px rgba(0,0,0,0.45)) drop-shadow(0 0 12px rgba(201,166,90,0.15))",
        }}
      >
        <ScrollVinylSvg />
      </div>
    </div>
  );
}
