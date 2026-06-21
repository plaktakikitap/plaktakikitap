"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SatelliteCards } from "@/components/home/SatelliteCards";

type Variant = "default" | "antiqueGold";

export type FlipFrameProps = {
  aSrc: string;
  bSrc: string;
  size?: number;
  variant?: Variant;
  intervalMs?: number;
  fadeMs?: number;
  altA?: string;
  altB?: string;
};

type FrameConfig = {
  wrapper: string;
  padding: number;
  innerRadius: number;
  mattePadding: number;
  imageRadius: number;
  shadow: string | null;
  outerFrameBoxShadow?: string;
  outerBg: string;
  matteBg: string;
  matteShadow: string;
};

const FRAME_CONFIG: Record<Variant, FrameConfig> = {
  default: {
    wrapper: "rounded-[18px]",
    padding: 10,
    innerRadius: 14,
    mattePadding: 12,
    imageRadius: 10,
    shadow: "0_22px_55px_-35px_rgba(0,0,0,0.55)",
    outerBg:
      "linear-gradient(135deg, rgba(122,89,58,0.95), rgba(78,56,37,0.95))",
    matteBg:
      "linear-gradient(180deg, rgba(250,247,242,1), rgba(245,240,232,1))",
    matteShadow:
      "inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -10px 30px rgba(0,0,0,0.06)",
  },
  antiqueGold: {
    wrapper: "rounded-[10px]",
    padding: 22,
    innerRadius: 10,
    mattePadding: 18,
    imageRadius: 0,
    shadow: null,
    outerFrameBoxShadow:
      "0 40px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.15), inset 0 -8px 20px rgba(0,0,0,0.2)",
    outerBg: `linear-gradient(145deg,
      #e8d078 0%,
      #c9a84a 12%,
      #9a7328 28%,
      #d4b65a 45%,
      #b89230 62%,
      #e2cc68 78%,
      #c9a84a 100%
    )`,
    matteBg: "#F7F0E2",
    matteShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
};

const LID_EASE = [0.34, 1.56, 0.64, 1] as const;
const FLIP_EASE = [0.22, 1, 0.36, 1] as const;

function FrameGlow({
  showLogo,
  hovered,
  visible,
  reduceMotion,
}: {
  showLogo: boolean;
  hovered: boolean;
  visible: boolean;
  reduceMotion: boolean;
}) {
  if (!visible) return null;

  const pulseOpacity = hovered ? [0.5, 0.9, 0.5] : [0.4, 0.75, 0.4];
  const pulseScale = [0.95, 1.05, 0.95];

  return (
    <motion.div
      className="frame-glow pointer-events-none absolute z-[5]"
      aria-hidden
      style={{
        inset: -40,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(180, 50, 40, 0.35) 0%, rgba(180, 50, 40, 0) 70%)",
        filter: "blur(24px)",
      }}
      animate={
        reduceMotion
          ? {
              opacity: showLogo ? 0 : 0.6,
              scale: showLogo ? 0.9 : 1,
            }
          : {
              opacity: showLogo ? 0 : pulseOpacity,
              scale: showLogo ? 0.9 : pulseScale,
            }
      }
      transition={
        reduceMotion
          ? { opacity: { duration: 0.4 }, scale: { duration: 0.4 } }
          : {
              opacity: {
                duration: showLogo ? 0.4 : 4,
                repeat: showLogo ? 0 : Infinity,
                ease: "easeInOut",
              },
              scale: {
                duration: showLogo ? 0.4 : 4,
                repeat: showLogo ? 0 : Infinity,
                ease: "easeInOut",
              },
            }
      }
    />
  );
}

function BoxLockDetail() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="absolute left-1/2 top-[58%] h-8 w-8 -translate-x-1/2 -translate-y-1/2"
      fill="none"
      aria-hidden
    >
      <rect
        x="12"
        y="16"
        width="16"
        height="14"
        rx="2"
        stroke="rgba(201,166,90,0.35)"
        strokeWidth="1"
      />
      <circle
        cx="20"
        cy="12"
        r="5"
        stroke="rgba(201,166,90,0.4)"
        strokeWidth="1"
      />
      <line
        x1="20"
        y1="17"
        x2="20"
        y2="24"
        stroke="rgba(201,166,90,0.3)"
        strokeWidth="0.75"
      />
    </svg>
  );
}

export default function FlipFrame({
  aSrc,
  bSrc,
  size = 220,
  variant = "default",
  intervalMs = 4000,
  fadeMs = 1400,
  altA = "Portrait",
  altB = "Plaktaki Kitap logo",
}: FlipFrameProps) {
  const reduce = useReducedMotion();
  const [boxOpened, setBoxOpened] = useState(false);
  const [lidGone, setLidGone] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [hovered, setHovered] = useState(false);

  const cfg = FRAME_CONFIG[variant];
  const effectiveSize =
    variant === "antiqueGold" ? Math.max(size, 280) : size;
  const maxSize = variant === "antiqueGold" ? 400 : 360;
  const responsiveSize = `min(${Math.min(effectiveSize, maxSize)}px, 85vw)`;

  const showBoxShell = !reduce && !lidGone;
  const showBoxBody = showBoxShell;
  const satellitesActive = Boolean(boxOpened && hovered);

  useEffect(() => {
    if (reduce) {
      setBoxOpened(true);
      setLidGone(true);
      return;
    }

    const openTimer = window.setTimeout(() => setBoxOpened(true), 600);
    return () => window.clearTimeout(openTimer);
  }, [reduce]);

  useEffect(() => {
    if (!boxOpened || reduce) return;

    const lidTimer = window.setTimeout(() => setLidGone(true), 900);
    return () => window.clearTimeout(lidTimer);
  }, [boxOpened, reduce]);

  useEffect(() => {
    if (!boxOpened || reduce) return;

    const t = window.setInterval(() => setShowLogo((v) => !v), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs, reduce, boxOpened]);

  const transition = useMemo(
    () => ({ duration: fadeMs / 1000, ease: FLIP_EASE }),
    [fadeMs]
  );

  return (
    <div
      className="relative mx-auto overflow-visible"
      style={{ width: responsiveSize, aspectRatio: "1 / 1" }}
      onMouseEnter={() => {
        if (boxOpened) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <SatelliteCards active={satellitesActive} />

      {showBoxBody && (
        <div
          className="absolute inset-0 z-10 rounded-[10px] bg-[#1a1714] shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
          aria-hidden={boxOpened}
        />
      )}

      {!boxOpened && showBoxShell && (
        <div className="pointer-events-none absolute inset-0 z-[15]">
          <BoxLockDetail />
        </div>
      )}

      <FrameGlow
        showLogo={showLogo}
        hovered={hovered}
        visible={boxOpened}
        reduceMotion={!!reduce}
      />

      <motion.div
        className="absolute inset-0 z-20"
        initial={false}
        animate={
          reduce
            ? { y: 0, opacity: 1, scale: 1 }
            : {
                y: boxOpened ? 0 : 40,
                opacity: boxOpened ? 1 : 0,
                scale: boxOpened ? 1 : 0.85,
              }
        }
        transition={{
          delay: boxOpened && !reduce ? 0.25 : 0,
          duration: reduce ? 0 : 0.5,
          ease: FLIP_EASE,
        }}
        style={{
          pointerEvents: boxOpened ? "auto" : "none",
          visibility: boxOpened || reduce ? "visible" : "hidden",
        }}
      >
        <div
          className={`absolute inset-0 ${cfg.wrapper}`}
          style={cfg.shadow ? { boxShadow: cfg.shadow } : undefined}
        >
          <div
            className={`absolute inset-0 ${cfg.wrapper}`}
            style={{
              background: cfg.outerBg,
              padding: cfg.padding,
              ...(cfg.outerFrameBoxShadow && {
                boxShadow: cfg.outerFrameBoxShadow,
              }),
            }}
          >
            {variant === "antiqueGold" && (
              <div
                className="absolute inset-0 rounded-[10px] opacity-[0.04] mix-blend-multiply"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
                aria-hidden
              />
            )}

            <div
              className="absolute rounded-[14px]"
              style={{
                inset: cfg.padding,
                borderRadius: cfg.innerRadius,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(0,0,0,0.08))",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -2px 6px rgba(0,0,0,0.15)",
              }}
            />

            <div
              className="relative h-full w-full rounded-[10px]"
              style={{
                padding: cfg.mattePadding,
                borderRadius: cfg.innerRadius,
                background: cfg.matteBg,
                boxShadow: cfg.matteShadow,
              }}
            >
              <div
                className="relative h-full w-full overflow-hidden"
                style={{
                  borderRadius: cfg.imageRadius || 2,
                  ...(variant === "antiqueGold" && {
                    border: "1px solid rgba(0,0,0,0.35)",
                  }),
                }}
              >
                <div
                  className="relative h-full w-full overflow-hidden"
                  style={{
                    borderRadius: variant === "antiqueGold" ? 1 : cfg.imageRadius,
                    backgroundColor:
                      variant === "antiqueGold" ? "#FBF4E6" : "#f5f5f0",
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 z-10 opacity-[0.06] mix-blend-soft-light"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
                    }}
                    aria-hidden
                  />

                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: reduce ? 1 : showLogo ? 0 : 1 }}
                    transition={transition}
                    style={{ filter: "contrast(1.06) saturate(1.03)" }}
                  >
                    <Image
                      src={aSrc}
                      alt={altA}
                      fill
                      sizes="(max-width: 768px) 85vw, 400px"
                      className="object-cover"
                      quality={95}
                      priority
                      unoptimized={aSrc.includes("eymen")}
                    />
                  </motion.div>

                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: reduce ? 0 : showLogo ? 1 : 0 }}
                    transition={transition}
                  >
                    <Image
                      src={bSrc}
                      alt={altB}
                      fill
                      sizes="(max-width: 768px) 85vw, 400px"
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {showBoxShell && !lidGone && (
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{ perspective: 900 }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-x-0 top-0 h-[52%] rounded-t-[10px] border-b border-black/25 shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
            style={{
              transformOrigin: "top center",
              transformStyle: "preserve-3d",
              background:
                "linear-gradient(180deg, #d4af6a 0%, #b89230 45%, #8a6427 100%)",
            }}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: boxOpened ? -110 : 0 }}
            transition={{ duration: 0.7, ease: LID_EASE }}
          >
            <div
              className="absolute inset-0 rounded-t-[10px] opacity-[0.12] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
