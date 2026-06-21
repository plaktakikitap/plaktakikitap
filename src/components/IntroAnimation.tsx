"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

const INTRO_SEEN_KEY = "plaktakikitap_intro_seen";
const TOTAL_MS = 2300;
const EASE = [0.42, 0, 0.58, 1] as const;

function IntroVinylDisk({
  rotate,
}: {
  rotate: ReturnType<typeof useMotionValue<number>>;
}) {
  return (
    <motion.div
      style={{ rotate }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <svg width="160" height="160" viewBox="0 0 120 120" aria-hidden>
        <defs>
          <radialGradient id="intro-vinyl-face" cx="36%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#2e2e2e" />
            <stop offset="50%" stopColor="#111111" />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>
          <radialGradient id="intro-vinyl-label" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e2c878" />
            <stop offset="55%" stopColor="#c9a65a" />
            <stop offset="100%" stopColor="#8a6d32" />
          </radialGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r="56"
          fill="url(#intro-vinyl-face)"
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
        <circle cx="60" cy="60" r="22" fill="url(#intro-vinyl-label)" />
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
    </motion.div>
  );
}

function IntroTonearm({ phase }: { phase: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-[78px] top-[78px] z-10 origin-top-left"
      initial={{ rotate: -25 }}
      animate={{ rotate: phase >= 2 ? -5 : -25 }}
      transition={{ duration: 0.7, ease: EASE, delay: phase >= 2 ? 0 : 0 }}
    >
      <div
        className="rounded-full bg-gradient-to-b from-[#e8e4dc] to-[#9a958a]"
        style={{
          width: 7,
          height: 7,
          boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}
      />
      <div
        className="absolute left-[2px] top-[3px] rounded-sm bg-gradient-to-r from-[#d4cfc4] via-[#f5f2ea] to-[#a8a399]"
        style={{
          width: 62,
          height: 3.5,
          transformOrigin: "left center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.45)",
        }}
      />
      <div
        className="absolute left-[58px] top-[-1px] rounded-full bg-[#1a1a1a] ring-1 ring-[#c9a65a]/40"
        style={{ width: 11, height: 11 }}
      />
    </motion.div>
  );
}

function SoundRipples({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a65a]"
          initial={{ scale: 0.55, opacity: 0.55 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{
            duration: 0.85,
            ease: "easeOut",
            repeat: Infinity,
            delay: i * 0.22,
          }}
        />
      ))}
    </>
  );
}

function IntroAnimationOverlay({
  reducedMotion,
  onComplete,
}: {
  reducedMotion: boolean;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState(1);
  const rotate = useMotionValue(0);
  const spinControlRef = useRef<ReturnType<typeof animate> | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    spinControlRef.current?.stop();
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    onComplete();
  }, [clearTimers, onComplete]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      const id = window.setTimeout(finish, 300);
      return () => window.clearTimeout(id);
    }

    schedule(() => setPhase(2), 300);
    schedule(() => setPhase(3), 1000);
    schedule(() => setPhase(4), 1800);
    schedule(() => finish(), TOTAL_MS);

    return clearTimers;
  }, [reducedMotion, schedule, finish, clearTimers]);

  useEffect(() => {
    if (reducedMotion || phase < 2) return;

    if (phase === 2) {
      spinControlRef.current?.stop();
      spinControlRef.current = animate(rotate, 90, {
        duration: 0.7,
        ease: EASE,
      });
      return;
    }

    if (phase >= 3) {
      spinControlRef.current?.stop();
      spinControlRef.current = animate(rotate, [90, 450], {
        duration: 0.75,
        ease: "linear",
        repeat: Infinity,
      });
    }
  }, [phase, reducedMotion, rotate]);

  if (reducedMotion) {
    return (
      <motion.div
        className="fixed inset-0 z-[10000] bg-[#0a0908]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-[#0a0908]"
      role="dialog"
      aria-label="Site giriş animasyonu"
    >
      <motion.div
        className="relative flex items-center justify-center"
        animate={
          phase >= 4
            ? { scale: 1.15, opacity: 0 }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.5, ease: EASE }}
      >
        <SoundRipples active={phase >= 3 && phase < 4} />
        <div className="relative h-[160px] w-[160px]">
          <IntroVinylDisk rotate={rotate} />
          <IntroTonearm phase={phase} />
        </div>
      </motion.div>

      <button
        type="button"
        onClick={finish}
        className="pointer-events-auto absolute bottom-6 right-6 font-sans text-[13px] tracking-wide text-[#9a9488] transition hover:text-[#c9a65a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a65a]/50"
      >
        atla →
      </button>
    </div>
  );
}

type IntroStatus = "pending" | "playing" | "idle";

export default function IntroAnimation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState<IntroStatus>("pending");

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(INTRO_SEEN_KEY, "true");
    } catch {
      /* private mode / blocked storage */
    }
  }, []);

  const finishIntro = useCallback(() => {
    markSeen();
    setStatus("idle");
  }, [markSeen]);

  useEffect(() => {
    if (pathname !== "/") {
      setStatus("idle");
      return;
    }

    try {
      if (localStorage.getItem(INTRO_SEEN_KEY) === "true") {
        setStatus("idle");
        return;
      }
    } catch {
      setStatus("idle");
      return;
    }

    setStatus("playing");
  }, [pathname]);

  if (pathname !== "/") {
    return <>{children}</>;
  }

  if (status === "pending") {
    return (
      <div className="fixed inset-0 z-[10000] bg-[#0a0908]" aria-hidden />
    );
  }

  return (
    <>
      {status === "idle" && children}
      {status === "playing" && (
        <IntroAnimationOverlay
          reducedMotion={!!reduceMotion}
          onComplete={finishIntro}
        />
      )}
    </>
  );
}
