"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  AnimatePresence,
  useScroll,
} from "framer-motion";
import FlipFrame from "@/components/home/FlipFrame";
import AnimatedTitle from "@/components/home/AnimatedTitle";
import RoomBackdrop from "@/components/home/RoomBackdrop";
import { ScrollIndicator } from "@/components/home/ScrollHint";

const EASE = [0.22, 1, 0.36, 1];

const POSE_IMAGE_PATHS = [
  "/images/easter-egg/pose-1.png",
  "/images/easter-egg/pose-2.png",
  "/images/easter-egg/pose-3.png",
];

const EASTER_EGG_QUOTES = [
  "Bir sayfa daha okusam mı acaba...",
  "Bu siteyi tasarlarken de bir yandan kitap okudum tabii",
  "Beni bulduğuna göre meraklısın, hoş geldin",
  "Plak mı kitap mı desek... ikisine de yetişiyorum.",
  "Burada oturuyorum, sen gez; ben bir iki sayfa daha alırım.",
  "Ajandamdaki post-it'ler gibi, ben de ara sıra ortaya çıkıyorum.",
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 16×16 piksel grid — pose 0: oturup kitap okuyor */
function PixelPoseSvg({ variant = 0 }) {
  const skin = "#e8dcc8";
  const hair = "#2a2218";
  const shirt = "#c9a65a";
  const pants = "#4a4035";
  const book = "#fff7c2";
  const bookEdge = "#c9a65a";
  const outline = "#1a1510";

  const poses = [
    <>
      <rect x="6" y="2" width="4" height="2" fill={hair} />
      <rect x="5" y="4" width="6" height="3" fill={skin} />
      <rect x="4" y="7" width="8" height="4" fill={shirt} />
      <rect x="3" y="11" width="3" height="3" fill={pants} />
      <rect x="10" y="11" width="3" height="3" fill={pants} />
      <rect x="6" y="8" width="4" height="3" fill={book} stroke={bookEdge} strokeWidth="0.3" />
      <rect x="5" y="9" width="1" height="1" fill={outline} opacity="0.35" />
    </>,
    <>
      <rect x="5" y="2" width="5" height="2" fill={hair} />
      <rect x="6" y="4" width="5" height="3" fill={skin} />
      <rect x="5" y="7" width="7" height="4" fill={shirt} />
      <rect x="4" y="11" width="4" height="3" fill={pants} />
      <rect x="9" y="12" width="3" height="2" fill={pants} />
      <rect x="3" y="8" width="3" height="4" fill={book} stroke={bookEdge} strokeWidth="0.3" />
      <rect x="2" y="10" width="1" height="1" fill={skin} />
    </>,
    <>
      <rect x="6" y="1" width="4" height="2" fill={hair} />
      <rect x="5" y="3" width="6" height="3" fill={skin} />
      <rect x="4" y="6" width="8" height="5" fill={shirt} />
      <rect x="3" y="11" width="4" height="4" fill={pants} />
      <rect x="9" y="11" width="4" height="4" fill={pants} />
      <rect x="7" y="9" width="3" height="2" fill={book} />
      <rect x="6" y="8" width="5" height="1" fill={bookEdge} opacity="0.6" />
    </>,
  ];

  return (
    <svg
      viewBox="0 0 16 16"
      width={40}
      height={40}
      aria-hidden
      className="block"
      style={{ imageRendering: "pixelated" }}
    >
      <rect width="16" height="16" fill="transparent" />
      {poses[variant % poses.length]}
    </svg>
  );
}

function CharacterVisual({ poseIndex }) {
  const [useSvg, setUseSvg] = useState(false);
  const src = POSE_IMAGE_PATHS[poseIndex % POSE_IMAGE_PATHS.length];

  useEffect(() => {
    setUseSvg(false);
  }, [poseIndex, src]);

  if (useSvg) {
    return <PixelPoseSvg variant={poseIndex} />;
  }

  return (
    <img
      src={src}
      alt=""
      width={40}
      height={40}
      className="h-10 w-10 object-contain"
      style={{ imageRendering: "pixelated" }}
      onError={() => setUseSvg(true)}
    />
  );
}

function EasterEggCharacter() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [poseIndex, setPoseIndex] = useState(0);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [quote, setQuote] = useState(EASTER_EGG_QUOTES[0]);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const scheduleHide = useCallback(() => {
    const stayMs = randomBetween(4000, 5000);
    const hideId = window.setTimeout(() => {
      setVisible(false);
      setBubbleOpen(false);
    }, stayMs);
    timersRef.current.push(hideId);
    return stayMs;
  }, []);

  const scheduleNextAppear = useCallback(
    (isFirst) => {
      const delayMs = isFirst
        ? randomBetween(8000, 15000)
        : randomBetween(20000, 40000);

      const appearId = window.setTimeout(() => {
        setPoseIndex(randomBetween(0, POSE_IMAGE_PATHS.length - 1));
        setVisible(true);
        const stayMs = scheduleHide();

        const nextId = window.setTimeout(() => {
          scheduleNextAppear(false);
        }, stayMs);
        timersRef.current.push(nextId);
      }, delayMs);

      timersRef.current.push(appearId);
    },
    [scheduleHide]
  );

  useEffect(() => {
    scheduleNextAppear(true);
    return clearTimers;
  }, [scheduleNextAppear, clearTimers]);

  const handleClick = () => {
    setQuote(
      EASTER_EGG_QUOTES[randomBetween(0, EASTER_EGG_QUOTES.length - 1)]
    );
    setBubbleOpen(true);
    const bubbleId = window.setTimeout(() => setBubbleOpen(false), 2000);
    timersRef.current.push(bubbleId);
  };

  return (
    <div
      className="pointer-events-none fixed bottom-3 right-3 z-40 sm:bottom-5 sm:right-5"
      aria-hidden={!visible}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            key={`egg-${poseIndex}-${visible}`}
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }
            }
            animate={
              reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
            }
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.45, ease: EASE }
            }
            className="relative"
          >
            <AnimatePresence>
              {bubbleOpen && (
                <motion.div
                  key="bubble"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  transition={
                    reduceMotion ? { duration: 0 } : { duration: 0.2 }
                  }
                  className="pointer-events-none absolute bottom-full right-0 mb-2 w-[min(220px,calc(100vw-2rem))]"
                >
                  <div className="relative rounded-xl border border-[#c9a65a]/35 bg-[#f7f0e2] px-3 py-2 text-left text-[11px] leading-snug text-[#3a3228] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    {quote}
                    <span
                      className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 border-b border-r border-[#c9a65a]/35 bg-[#f7f0e2]"
                      aria-hidden
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={handleClick}
              className="pointer-events-auto cursor-pointer rounded-md p-0.5 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a65a]/60"
              aria-label="Gizli karakter — tıkla"
            >
              <CharacterVisual poseIndex={poseIndex} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SpinningVinylIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="now-playing-vinyl h-5 w-5 shrink-0"
    >
      <circle cx="12" cy="12" r="11" fill="#1a1510" stroke="#c9a65a" strokeWidth="0.75" />
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="#3a3228" strokeWidth="0.5" opacity="0.6" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="#3a3228" strokeWidth="0.35" opacity="0.45" />
      <circle cx="12" cy="12" r="3.5" fill="none" stroke="#3a3228" strokeWidth="0.35" opacity="0.35" />
      <circle cx="12" cy="12" r="2" fill="#c9a65a" />
      <circle cx="12" cy="12" r="0.75" fill="#1a1510" />
    </svg>
  );
}

function NowPlayingStrip({ nowPlaying }) {
  const [song, setSong] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/now-playing");
        if (!res.ok) {
          setSong(null);
          return;
        }
        const data = await res.json();
        setSong(data);
      } catch {
        setSong(null);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const book = nowPlaying?.book ?? null;

  if (!song && !book) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 1, ease: EASE }}
      className="now-playing-strip mx-auto mt-5 w-full max-w-[600px] sm:mt-6"
    >
      <div className="now-playing-strip-inner flex items-stretch gap-0 rounded-lg border border-[rgba(201,166,90,0.15)] bg-[rgba(255,255,255,0.03)] px-4 py-3 sm:px-6 sm:py-3">
        {song ? (
          <>
            <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-3 sm:pr-4">
              {song.albumArt ? (
                <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-white/5">
                  <Image
                    src={song.albumArt}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="20px"
                  />
                </div>
              ) : (
                <SpinningVinylIcon />
              )}
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-[#9a9488]">
                  {song.isNowPlaying ? "şu an dinliyorum" : "son dinlediğim"}
                </p>
                <p className="truncate text-[12px] leading-snug text-[#F3EBDD]/90 sm:text-[13px]">
                  {song.title}
                </p>
                <p className="truncate text-[12px] leading-snug text-[#9a9488] sm:text-[13px]">
                  {song.artist}
                </p>
              </div>
            </div>

            {book ? (
              <div className="now-playing-strip-divider shrink-0 self-stretch" aria-hidden />
            ) : null}
          </>
        ) : null}

        {book ? (
          <div className="flex min-w-0 flex-1 items-center gap-2.5 pl-3 sm:pl-4">
            <div className="relative h-8 w-6 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-white/5">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="24px"
                />
              ) : (
                <div className="h-full w-full bg-white/5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-[#9a9488]">
                şu an okuyorum
              </p>
              <p className="truncate text-[12px] leading-snug text-[#F3EBDD]/90 sm:text-[13px]">
                {book.title ?? "—"}
              </p>
              <p className="truncate text-[12px] leading-snug text-[#9a9488] sm:text-[13px]">
                {book.author ?? " "}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

/**
 * @param {{
 *   photoSrc: string;
 *   logoSrc: string;
 *   title?: string;
 *   subtitle?: string;
 *   nowPlaying?: import("@/types/now-playing").NowPlayingData | null;
 * }} props
 */
export default function HeroSection({
  photoSrc,
  logoSrc,
  title = "Hoş geldiniz, ben Eymen!",
  subtitle = "yanii... nam-ı diğer Plaktaki Kitap",
  nowPlaying = null,
}) {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const scrollEffectsEnabled = !reduce;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-start overflow-hidden px-4 pt-10 pb-4 sm:px-6 sm:pt-14 sm:pb-6"
    >
      <RoomBackdrop
        scrollYProgress={scrollEffectsEnabled ? scrollYProgress : undefined}
        scrollEffectsEnabled={scrollEffectsEnabled}
      />
      <EasterEggCharacter />

      <div className="relative z-[1] mx-auto flex w-full max-w-5xl flex-col items-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: EASE }}
          className="flex w-full max-w-[280px] justify-center sm:max-w-[320px]"
        >
          <FlipFrame
            aSrc={photoSrc}
            bSrc={logoSrc}
            size={320}
            variant="antiqueGold"
            intervalMs={4200}
            fadeMs={1600}
            altA="Eymen portre"
            altB="Plaktaki Kitap logo"
          />
        </motion.div>

        <div className="mt-8 flex w-full max-w-6xl flex-col items-center sm:mt-12 sm:flex-row sm:items-center sm:px-4">
          <div className="hidden flex-1 justify-start sm:flex">
            <ScrollIndicator />
          </div>

          <AnimatedTitle
            text={title}
            className="home-hero-h1 shrink-0 px-2 text-center font-display text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-[#F3EBDD] min-[400px]:text-[34px] sm:px-8 sm:text-[52px] md:text-[72px] lg:text-[80px]"
          />

          <div className="hidden flex-1 justify-end sm:flex">
            <ScrollIndicator />
          </div>
        </div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease: EASE }}
          className="mt-3 text-center font-sans text-xs font-normal tracking-[0.02em] text-[#F3EBDD]/85 sm:mt-5 sm:text-sm md:text-base"
        >
          {subtitle}
        </motion.p>

        <NowPlayingStrip nowPlaying={nowPlaying} />
      </div>
    </section>
  );
}
