"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const REPEL_THRESHOLD = 80;
const REPEL_MAX = 14;
const SPRING = { stiffness: 150, damping: 15 };

type CharRegistration = {
  element: HTMLSpanElement;
  setOffset: (x: number, y: number) => void;
};

function getWordStaggerDelays(text: string): number[] {
  let wordIndex = 0;
  let charInWord = 0;

  return text.split("").map((char) => {
    const delay = wordIndex * 0.1 + charInWord * 0.02;
    if (char === " ") {
      wordIndex += 1;
      charInWord = 0;
    } else {
      charInWord += 1;
    }
    return delay;
  });
}

function CharLetter({
  char,
  delay,
  reduceMotion,
  repelActive,
  onRegister,
}: {
  char: string;
  delay: number;
  reduceMotion: boolean;
  repelActive: boolean;
  onRegister: (registration: CharRegistration | null) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const springX = useSpring(offsetX, SPRING);
  const springY = useSpring(offsetY, SPRING);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    onRegister({
      element,
      setOffset: (x, y) => {
        offsetX.set(x);
        offsetY.set(y);
      },
    });

    return () => onRegister(null);
  }, [onRegister, offsetX, offsetY]);

  useEffect(() => {
    if (!repelActive) {
      offsetX.set(0);
      offsetY.set(0);
    }
  }, [repelActive, offsetX, offsetY]);

  return (
    <motion.span
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : delay + 0.12,
        ease: EASE,
      }}
      style={{
        display: "inline-block",
        ...(repelActive
          ? { x: springX, y: springY }
          : {}),
      }}
      aria-hidden={char === " " ? true : undefined}
    >
      {char === " " ? "\u0020" : char}
    </motion.span>
  );
}

export default function AnimatedTitle({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLHeadingElement>(null);
  const chars = useMemo(() => text.split(""), [text]);
  const delays = useMemo(() => getWordStaggerDelays(text), [text]);

  const registrationsRef = useRef<(CharRegistration | null)[]>([]);
  const layoutsRef = useRef<{ cx: number; cy: number }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const [entryDone, setEntryDone] = useState(false);
  const [repelEnabled, setRepelEnabled] = useState(false);

  const maxEntryDelay = delays.length
    ? Math.max(...delays) + 0.12 + 0.55
    : 0.67;

  useEffect(() => {
    if (reduceMotion) {
      setEntryDone(true);
      return;
    }

    const timer = window.setTimeout(
      () => setEntryDone(true),
      maxEntryDelay * 1000
    );
    return () => window.clearTimeout(timer);
  }, [maxEntryDelay, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !entryDone) {
      setRepelEnabled(false);
      return;
    }

    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setRepelEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [entryDone, reduceMotion]);

  const measureLayouts = useCallback(() => {
    layoutsRef.current = registrationsRef.current.map((registration) => {
      if (!registration) return { cx: 0, cy: 0 };
      const rect = registration.element.getBoundingClientRect();
      return {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
      };
    });
  }, []);

  useEffect(() => {
    if (!entryDone) return;

    const frame = window.requestAnimationFrame(measureLayouts);
    window.addEventListener("resize", measureLayouts);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureLayouts);
    };
  }, [entryDone, measureLayouts, text]);

  const registerChar = useCallback(
    (index: number) => (registration: CharRegistration | null) => {
      registrationsRef.current[index] = registration;
    },
    []
  );

  useEffect(() => {
    if (!repelEnabled) return;

    const applyRepel = () => {
      const { x: mx, y: my } = mouseRef.current;

      registrationsRef.current.forEach((registration, index) => {
        if (!registration) return;

        const layout = layoutsRef.current[index];
        if (!layout) return;

        const dx = layout.cx - mx;
        const dy = layout.cy - my;
        const distance = Math.hypot(dx, dy);

        if (distance < REPEL_THRESHOLD && distance > 0.5) {
          const force = (1 - distance / REPEL_THRESHOLD) * REPEL_MAX;
          registration.setOffset(
            (dx / distance) * force,
            (dy / distance) * force
          );
        } else {
          registration.setOffset(0, 0);
        }
      });

      rafRef.current = null;
    };

    const onMouseMove = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };

      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(applyRepel);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [repelEnabled]);

  registrationsRef.current.length = chars.length;

  return (
    <h1 ref={containerRef} className={className}>
      {chars.map((char, index) => (
        <CharLetter
          key={`${index}-${char}`}
          char={char}
          delay={delays[index] ?? 0}
          reduceMotion={!!reduceMotion}
          repelActive={repelEnabled}
          onRegister={registerChar(index)}
        />
      ))}
    </h1>
  );
}
