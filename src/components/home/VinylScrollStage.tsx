"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";
import { VinylRecord } from "@/components/VinylRecord";
import { NowPlaying } from "@/components/NowPlaying";
import { NAV_CARDS } from "@/components/home/nav-cards";
import { KaralamalarHomeSection } from "@/components/karalamalar/KaralamalarHomeSection";
import { LazyAjanda } from "@/components/home/LazyAjanda";
import { NavCardIllustration } from "@/components/home/NavCardIllustration";
import type { Video } from "@/types/videos";
import type { Karalama } from "@/lib/karalamalar";

interface VinylScrollStageProps {
  title: string;
  subtitle: string;
  logoSrc?: string | null;
  latestVideo?: Video | null;
  latestVideoThumb?: string | null;
  karalamalarPreview?: Karalama[];
  children?: React.ReactNode;
}

/** Pikap genişliği — plak yuvası SVG’de (160,148), viewBox 360×260 */
const PIKAP_W = "min(340px, 42vw)";
/** Yuva çapı ≈ 144/360 of pikap width */
const VINYL_ON_PLATTER = `calc(${PIKAP_W} * 0.4)`;
/** İlk karede yalnız üst yarı → çap ≈ 2× viewport */
const VINYL_SIZE = "calc(2 * (100vh - 4rem))";

/** Karşıdan görünüm — dikdörtgen gövde, plak yuvası, tonearm, kenar notaları için alan */
function FrontPikap() {
  return (
    <svg
      viewBox="0 0 360 260"
      fill="none"
      aria-hidden
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <g opacity="0.4" stroke="rgba(192,160,96,0.4)" strokeWidth="1">
        <line x1="8" y1="232" x2="352" y2="232" />
        <line x1="20" y1="242" x2="340" y2="242" />
        <line x1="40" y1="252" x2="320" y2="252" />
      </g>

      <ellipse cx="70" cy="218" rx="10" ry="5" fill="#1a1208" />
      <ellipse cx="290" cy="218" rx="10" ry="5" fill="#1a1208" />

      <rect
        x="28"
        y="78"
        width="304"
        height="140"
        rx="6"
        fill="url(#pikapWood)"
        stroke="rgba(192,160,96,0.45)"
        strokeWidth="1.5"
      />
      <rect
        x="36"
        y="86"
        width="288"
        height="8"
        rx="2"
        fill="rgba(255,255,255,0.05)"
      />

      {/* Plak yuvası — merkez ~ (160, 148) */}
      <circle
        cx="160"
        cy="148"
        r="78"
        fill="#0a0704"
        stroke="rgba(192,160,96,0.28)"
        strokeWidth="2"
      />
      <circle cx="160" cy="148" r="72" fill="#080604" />

      {/* Tonearm — karşıdan */}
      <g>
        <circle
          cx="268"
          cy="108"
          r="8"
          fill="#2a2218"
          stroke="#c0a060"
          strokeWidth="1"
        />
        <path
          d="M268 108 L210 155"
          stroke="#c9b896"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M210 155 L198 162"
          stroke="#a89060"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="196" cy="164" r="4" fill="#c0a060" />
      </g>

      <circle
        cx="300"
        cy="175"
        r="14"
        fill="#1e1810"
        stroke="rgba(192,160,96,0.5)"
        strokeWidth="1.5"
      />
      <circle cx="300" cy="175" r="4" fill="#c0a060" opacity="0.7" />

      <defs>
        <linearGradient id="pikapWood" x1="28" y1="78" x2="332" y2="218">
          <stop offset="0%" stopColor="#2a1c0e" />
          <stop offset="45%" stopColor="#1a1008" />
          <stop offset="100%" stopColor="#120c06" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const EDGE_NOTES = [
  { note: "♪", x: "-10%", y: "16%", size: "1.45rem", delay: 0 },
  { note: "♫", x: "98%", y: "10%", size: "1.2rem", delay: 0.35 },
  { note: "♩", x: "-8%", y: "64%", size: "1.6rem", delay: 0.7 },
  { note: "♬", x: "96%", y: "60%", size: "1.3rem", delay: 0.15 },
  { note: "♪", x: "46%", y: "-12%", size: "1.1rem", delay: 0.95 },
  { note: "♫", x: "104%", y: "36%", size: "1rem", delay: 0.5 },
  { note: "♩", x: "-14%", y: "38%", size: "1.25rem", delay: 1.1 },
] as const;

/** Pikap merkezine göre kart slotları — üstte bulut, pikaba binmez */
const CARD_SLOTS: { x: number; y: number }[] = [
  { x: -360, y: -210 },
  { x: -120, y: -235 },
  { x: 120, y: -235 },
  { x: 360, y: -210 },
  { x: -360, y: -95 },
  { x: -120, y: -110 },
  { x: 120, y: -110 },
  { x: 360, y: -95 },
];

function NoteCard({
  index,
  progress,
  reduceMotion,
}: {
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const card = NAV_CARDS[index];
  const slot = CARD_SLOTS[index] ?? { x: 0, y: 0 };
  const stagger = index * 0.018;

  const opacity = useTransform(
    progress,
    [0.42 + stagger, 0.52 + stagger, 0.64 + stagger],
    [0, 0.9, 1]
  );
  const x = useTransform(progress, [0.4 + stagger, 0.64 + stagger], [0, slot.x]);
  const y = useTransform(
    progress,
    [0.4 + stagger, 0.64 + stagger],
    [40, slot.y]
  );
  const scale = useTransform(
    progress,
    [0.4 + stagger, 0.6 + stagger],
    [0.2, 1]
  );
  const rotate = useTransform(
    progress,
    [0.4 + stagger, 0.64 + stagger],
    [index % 2 === 0 ? -14 : 12, 0]
  );
  const pointerEvents = useTransform(opacity, (o) =>
    o > 0.45 ? "auto" : "none"
  );

  if (!card) return null;

  const inner = (
    <Link
      href={card.href}
      className="group block w-[168px] rounded-xl border border-rule bg-card px-3 py-3 shadow-[0_8px_24px_rgba(26,22,18,0.08)] backdrop-blur-sm transition hover:border-gold/40 hover:bg-[color-mix(in_srgb,var(--cream)_92%,white)]"
    >
      <div className="flex items-start gap-2">
        <NavCardIllustration
          visual={card.visual}
          className="mt-0.5 h-9 w-9 shrink-0 transition group-hover:scale-105"
        />
        <div className="min-w-0">
          <div className="type-4 font-editorial leading-snug text-ink">
            {card.title}
          </div>
          <div className="type-4 mt-1 leading-snug text-ink-muted">
            {card.subtitle}
          </div>
        </div>
      </div>
    </Link>
  );

  if (reduceMotion) {
    return (
      <div
        className="absolute z-30"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${slot.x}px), calc(-50% + ${slot.y}px))`,
        }}
      >
        {inner}
      </div>
    );
  }

  return (
    <motion.div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        x,
        y,
        scale,
        rotate,
        opacity,
        zIndex: 30,
        marginLeft: -84,
        marginTop: -36,
        pointerEvents,
      }}
    >
      {inner}
    </motion.div>
  );
}

export function VinylScrollStage({
  title,
  subtitle,
  logoSrc,
  karalamalarPreview = [],
  children,
}: VinylScrollStageProps) {
  const reduceMotionPref = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const reduceMotion = mounted && !!reduceMotionPref;
  const runwayRef = useRef<HTMLDivElement>(null);
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = runwayRef.current;
      if (!el) return;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
      scrollYProgress.set(p);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener("scroll", onScroll, opts);
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scrollYProgress]);

  // Plak: koca üst yarı → pikap yuvasına (aynı merkez)
  const vinylScale = useTransform(
    scrollYProgress,
    [0, 0.28, 0.48],
    [1, 0.32, 0.078]
  );
  // Başta aşağıda (üst yarı görünür) → yuvada 0
  const vinylNudgeY = useTransform(
    scrollYProgress,
    [0, 0.28, 0.48],
    ["46vh", "16vh", "0vh"]
  );

  const pikapOpacity = useTransform(scrollYProgress, [0.14, 0.34], [0, 1]);
  const pikapScale = useTransform(scrollYProgress, [0.14, 0.38], [0.9, 1]);
  const notesOpacity = useTransform(scrollYProgress, [0.26, 0.4], [0, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const vinylPE = useTransform(scrollYProgress, (v) =>
    v < 0.4 ? "auto" : "none"
  );
  // Animasyon bitsin → sahne yukarı; alt içerik zaten çekilmiş olsun
  const stageY = useTransform(scrollYProgress, [0.78, 1], ["0vh", "-100vh"]);
  const stageOpacity = useTransform(scrollYProgress, [0.9, 1], [1, 0]);
  const stagePE = useTransform(scrollYProgress, (v) =>
    v > 0.8 ? "none" : "auto"
  );

  const stage = (
      <motion.div
        className="hidden md:block"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 5,
          overflow: "hidden",
          y: reduceMotion ? 0 : stageY,
          opacity: reduceMotion ? 1 : stageOpacity,
          pointerEvents: reduceMotion ? "auto" : stagePE,
          backgroundColor: "var(--cream)",
          backgroundImage: "none",
        }}
      >
          <motion.div
            style={{
              position: "absolute",
              top: "2.5vh",
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 40,
              opacity: reduceMotion ? 0 : titleOpacity,
              pointerEvents: "none",
            }}
          >
            <h1
              className="type-2 font-editorial"
              style={{
                margin: 0,
                letterSpacing: "0.04em",
                fontWeight: 400,
                color: "var(--ink)",
              }}
            >
              {title}
            </h1>
            <p className="section-eyebrow mt-2">
              {subtitle}
            </p>
          </motion.div>

          {/* Sahne — pikap + plak aynı yuva merkezinde */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
              paddingTop: "2vh",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "min(1100px, 96vw)",
                height: "min(720px, 86vh)",
              }}
            >
              {NAV_CARDS.map((_, i) => (
                <NoteCard
                  key={NAV_CARDS[i].href}
                  index={i}
                  progress={scrollYProgress}
                  reduceMotion={reduceMotion}
                />
              ))}

              {/* Ortak merkez = plak yuvasının merkezi (SVG 160,148) */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "58%",
                  width: 0,
                  height: 0,
                  zIndex: 10,
                }}
              >
                {/* Pikap: yuva (160/360, 148/260) → merkeze hizalı */}
                <motion.div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: PIKAP_W,
                    marginLeft: `calc(${PIKAP_W} * ${-160 / 360})`,
                    marginTop: `calc(${PIKAP_W} * ${-148 / 360})`,
                    opacity: reduceMotion ? 1 : pikapOpacity,
                    scale: reduceMotion ? 1 : pikapScale,
                    pointerEvents: "none",
                    transformOrigin: `${(160 / 360) * 100}% ${(148 / 260) * 100}%`,
                  }}
                >
                  <FrontPikap />
                  <motion.div
                    style={{
                      opacity: reduceMotion ? 1 : notesOpacity,
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                    }}
                  >
                    {EDGE_NOTES.map(({ note, x, y, size, delay }, i) => (
                      <span
                        key={i}
                        style={{
                          position: "absolute",
                          left: x,
                          top: y,
                          fontSize: size,
                          color: "rgba(140,102,64,0.45)",
                          animation: reduceMotion
                            ? undefined
                            : `floatNote ${2.2 + i * 0.25}s ease-in-out infinite`,
                          animationDelay: `${delay}s`,
                        }}
                      >
                        {note}
                      </span>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Plak — aynı merkez; küçülünce yuvaya oturur */}
                <motion.div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: reduceMotion ? VINYL_ON_PLATTER : VINYL_SIZE,
                    height: reduceMotion ? VINYL_ON_PLATTER : VINYL_SIZE,
                    marginLeft: reduceMotion
                      ? `calc(${VINYL_ON_PLATTER} / -2)`
                      : `calc(${VINYL_SIZE} / -2)`,
                    marginTop: reduceMotion
                      ? `calc(${VINYL_ON_PLATTER} / -2)`
                      : `calc(${VINYL_SIZE} / -2)`,
                    y: reduceMotion ? 0 : vinylNudgeY,
                    scale: reduceMotion ? 1 : vinylScale,
                    transformOrigin: "center center",
                    zIndex: 25,
                    pointerEvents: reduceMotion ? "auto" : vinylPE,
                  }}
                >
                  <VinylRecord logoSrc={logoSrc} />
                </motion.div>

                {/* Son dinlenen — pikabın altında, ortada */}
                <motion.div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 0,
                    x: "-50%",
                    marginTop: `calc(${PIKAP_W} * ${ (260 - 148) / 360 } + 14px)`,
                    opacity: reduceMotion ? 1 : pikapOpacity,
                    pointerEvents: "none",
                    zIndex: 30,
                    width: "min(92vw, 40rem)",
                  }}
                >
                  <NowPlaying />
                </motion.div>
              </div>
            </div>
          </div>

          {!reduceMotion ? (
            <motion.div
              style={{
                opacity: arrowOpacity,
                position: "absolute",
                bottom: "3vh",
                left: "50%",
                x: "-50%",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                color: "rgba(192,160,96,0.65)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                pointerEvents: "none",
              }}
            >
              <span>kaydır</span>
              <motion.span
                animate={{ y: [0, 7, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  ease: "easeInOut",
                }}
                style={{ fontSize: "1.1rem" }}
              >
                ↓
              </motion.span>
            </motion.div>
          ) : null}
      </motion.div>
  );

  return (
    <div className="vinyl-page-bg relative hidden md:block overflow-clip">
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.22,
            mixBlendMode: "overlay",
            backgroundImage:
              "radial-gradient(rgba(90,68,48,0.08) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {[
          { left: "18%", top: "22%", size: 10, delay: "0s" },
          { left: "82%", top: "28%", size: 10, delay: "1.2s" },
          { left: "12%", top: "65%", size: 14, delay: "2.4s" },
          { left: "88%", top: "72%", size: 10, delay: "0.8s" },
          { left: "45%", top: "12%", size: 10, delay: "1.8s" },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-sparkle"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              background:
                "radial-gradient(circle at center, rgba(192,160,96,0.55) 0%, rgba(168,140,110,0.2) 45%, transparent 70%)",
              boxShadow: "0 0 10px rgba(168,140,110,0.2)",
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      {/* Pist + çekim: marginTop ≈ -(runway - 100vh) olmalı; taşma overflow-clip ile kesilir */}
      <div ref={runwayRef} style={{ height: reduceMotion ? "100vh" : "185vh" }} />

      {mounted ? createPortal(stage, document.body) : null}

      <section
        className="relative z-[4] section-block px-[4vw]"
        style={{
          marginTop: reduceMotion ? 0 : "-85vh",
        }}
      >
        <KaralamalarHomeSection items={karalamalarPreview} />
        <div className="py-8">
          <hr className="section-divider" aria-hidden />
        </div>
        <LazyAjanda />
        <div className="mx-auto mt-8 max-w-[1100px]">{children}</div>
      </section>
    </div>
  );
}
