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
const WORD_STAGGER = 0.15;
const LETTER_STAGGER = 0.03;
const INTRO_VOICE_URL = "/audio/intro-voice.mp3";
const WAVEFORM_BAR_COUNT = 50;
const WAVEFORM_MAX_HEIGHT_PX = 60;

/** Ses yoksa dekoratif yedek dalga */
function fallbackWaveform(count = WAVEFORM_BAR_COUNT): number[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(count - 1, 1);
    return (
      0.25 +
      0.55 * Math.abs(Math.sin(t * Math.PI * 3.2)) *
        (0.65 + 0.35 * Math.sin(t * Math.PI * 7))
    );
  });
}

async function extractWaveformFromAudio(url: string): Promise<number[]> {
  const response = await fetch(url);
  if (!response.ok) {
    // Dosya henüz yüklenmemiş olabilir — hata fırlatma, yedek kullan
    return fallbackWaveform();
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength < 128) {
    return fallbackWaveform();
  }

  const audioContext = new AudioContext();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const samples = audioBuffer.getChannelData(0);
    const samplesPerBar = Math.floor(samples.length / WAVEFORM_BAR_COUNT);
    const amplitudes: number[] = [];

    for (let i = 0; i < WAVEFORM_BAR_COUNT; i++) {
      const start = i * samplesPerBar;
      const end =
        i === WAVEFORM_BAR_COUNT - 1
          ? samples.length
          : start + samplesPerBar;
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += Math.abs(samples[j] ?? 0);
      }
      amplitudes.push(sum / Math.max(end - start, 1));
    }

    const peak = Math.max(...amplitudes, 0.0001);
    return amplitudes.map((value) => value / peak);
  } catch {
    return fallbackWaveform();
  } finally {
    await audioContext.close();
  }
}

function TitleWaveform({
  data,
  reduceMotion,
}: {
  data: number[];
  reduceMotion: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      aria-hidden
    >
      <div className="flex items-center justify-center gap-[3px]">
        {data.map((amplitude, index) => (
          <motion.div
            key={index}
            style={{
              width: 2,
              height: Math.max(4, amplitude * WAVEFORM_MAX_HEIGHT_PX),
              backgroundColor: "rgba(184,147,74,0.12)",
              borderRadius: 1,
              transformOrigin: "center center",
            }}
            animate={
              reduceMotion
                ? { scaleY: 1 }
                : { scaleY: [1, 1.15, 0.9, 1] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 2 + (index % 3) * 0.4,
                    repeat: Infinity,
                    delay: index * 0.04,
                    ease: "easeInOut",
                  }
            }
          />
        ))}
      </div>
    </div>
  );
}

type CharRegistration = {
  element: HTMLSpanElement;
  setOffset: (x: number, y: number) => void;
};

type WordLetters = {
  word: string;
  wordIndex: number;
  letters: {
    char: string;
    letterIndex: number;
    globalIndex: number;
    delay: number;
  }[];
};

function buildWordLetters(text: string): WordLetters[] {
  const words = text.split(" ").filter((word) => word.length > 0);
  let globalIndex = 0;

  return words.map((word, wordIndex) => ({
    word,
    wordIndex,
    letters: [...word].map((char, letterIndex) => {
      const entry = {
        char,
        letterIndex,
        globalIndex,
        delay: wordIndex * WORD_STAGGER + letterIndex * LETTER_STAGGER,
      };
      globalIndex += 1;
      return entry;
    }),
  }));
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
      className="hero-letter"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : delay + 0.12,
        ease: EASE,
      }}
      style={{
        display: "inline-block",
        ...(repelActive ? { x: springX, y: springY } : {}),
      }}
    >
      {char}
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
  const wordLetters = useMemo(() => buildWordLetters(text), [text]);
  const letterCount = useMemo(
    () => wordLetters.reduce((sum, entry) => sum + entry.letters.length, 0),
    [wordLetters]
  );

  const registrationsRef = useRef<(CharRegistration | null)[]>([]);
  const layoutsRef = useRef<{ cx: number; cy: number }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const [entryDone, setEntryDone] = useState(false);
  const [repelEnabled, setRepelEnabled] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const displayWaveform = useMemo(
    () =>
      isMobile ? waveformData.filter((_, index) => index % 2 === 0) : waveformData,
    [isMobile, waveformData]
  );

  useEffect(() => {
    let cancelled = false;

    extractWaveformFromAudio(INTRO_VOICE_URL)
      .then((data) => {
        if (!cancelled) setWaveformData(data);
      })
      .catch(() => {
        if (!cancelled) setWaveformData(fallbackWaveform());
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const maxEntryDelay = useMemo(() => {
    let max = 0;
    for (const entry of wordLetters) {
      for (const letter of entry.letters) {
        if (letter.delay > max) max = letter.delay;
      }
    }
    return max + 0.12 + 0.55;
  }, [wordLetters]);

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

  registrationsRef.current.length = letterCount;

  return (
    <div className="relative w-full">
      {displayWaveform.length > 0 ? (
        <TitleWaveform data={displayWaveform} reduceMotion={!!reduceMotion} />
      ) : null}
      <h1 ref={containerRef} className={`relative z-[1] ${className}`}>
        {wordLetters.map(({ letters, wordIndex }) => (
          <span key={wordIndex}>
            {wordIndex > 0 ? " " : null}
            <span
              style={{ display: "inline-block", whiteSpace: "nowrap" }}
            >
              {letters.map(({ char, letterIndex, globalIndex, delay }) => (
                <CharLetter
                  key={`${wordIndex}-${letterIndex}`}
                  char={char}
                  delay={delay}
                  reduceMotion={!!reduceMotion}
                  repelActive={repelEnabled}
                  onRegister={registerChar(globalIndex)}
                />
              ))}
            </span>
          </span>
        ))}
      </h1>
    </div>
  );
}
