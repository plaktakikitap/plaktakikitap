"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

const OVERLAY_MS = 550;

function VinylWithTonearm() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative h-[120px] w-[120px]">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        aria-hidden
        className="relative z-0"
      >
        <defs>
          <radialGradient id="pt-vinyl-face" cx="36%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#2e2e2e" />
            <stop offset="50%" stopColor="#111111" />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>
          <radialGradient id="pt-vinyl-label" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e2c878" />
            <stop offset="55%" stopColor="#c9a65a" />
            <stop offset="100%" stopColor="#8a6d32" />
          </radialGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r="56"
          fill="url(#pt-vinyl-face)"
          stroke="#1a1a1a"
          strokeWidth="1.2"
        />
        {[50, 44, 38, 32, 26].map((r) => (
          <circle
            key={r}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="0.8"
          />
        ))}
        <circle cx="60" cy="60" r="22" fill="url(#pt-vinyl-label)" />
        <circle
          cx="60"
          cy="60"
          r="4"
          fill="#0a0908"
          stroke="#f3ebdd"
          strokeWidth="1.2"
        />
        <ellipse
          cx="46"
          cy="42"
          rx="14"
          ry="8"
          fill="rgba(255,255,255,0.08)"
          transform="rotate(-24 60 60)"
        />
      </svg>

      {/* Plak kolu — pivot sol üst (pikap gövdesi), saat 7 → 10 yönü */}
      <motion.div
        className="pointer-events-none absolute left-[58px] top-[58px] z-10 origin-top-left"
        initial={false}
        animate={
          reduceMotion
            ? { rotate: -20 }
            : { rotate: [-20, 15, -20] }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 0.42,
                times: [0, 0.48, 1],
                ease: [0.22, 1, 0.36, 1],
              }
        }
      >
        <div
          className="rounded-full bg-gradient-to-b from-[#e8e4dc] to-[#9a958a]"
          style={{
            width: 6,
            height: 6,
            boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
          }}
        />
        <div
          className="absolute left-[2px] top-[3px] rounded-sm bg-gradient-to-r from-[#d4cfc4] via-[#f5f2ea] to-[#a8a399]"
          style={{
            width: 52,
            height: 3,
            transformOrigin: "left center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.45)",
          }}
        />
        <div
          className="absolute left-[48px] top-[-1px] rounded-full bg-[#1a1a1a] ring-1 ring-[#c9a65a]/40"
          style={{ width: 10, height: 10 }}
        />
      </motion.div>
    </div>
  );
}

function RouteTransitionOverlay({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key="vinyl-route-overlay"
          className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0908]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{
            duration: OVERLAY_MS / 1000,
            times: [0, 0.12, 0.78, 1],
            ease: "easeInOut",
          }}
          aria-hidden
        >
          <VinylWithTonearm />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isFirstRoute = useRef(true);
  const [overlayActive, setOverlayActive] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;

    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }

    setOverlayActive(true);
    const timer = window.setTimeout(() => setOverlayActive(false), OVERLAY_MS);
    return () => window.clearTimeout(timer);
  }, [pathname, reduceMotion]);

  return (
    <>
      <RouteTransitionOverlay active={overlayActive} />
      {children}
    </>
  );
}
