"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Variant = "default" | "antiqueGold";

type Props = {
  aSrc: string; // portrait
  bSrc: string; // logo
  size?: number; // px for desktop; will be responsive
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

export default function FramedCrossfade({
  aSrc,
  bSrc,
  size = 220,
  variant = "default",
  intervalMs = 4000,
  fadeMs = 1400,
  altA = "Portrait",
  altB = "Plaktaki Kitap logo",
}: Props) {
  const reduce = useReducedMotion();
  const [showB, setShowB] = useState(false);
  const cfg = FRAME_CONFIG[variant];

  const effectiveSize =
    variant === "antiqueGold" ? Math.max(size, 280) : size;
  const maxSize = variant === "antiqueGold" ? 400 : 360;
  const responsiveSize = `min(${Math.min(effectiveSize, maxSize)}px, 85vw)`;

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setShowB((v) => !v), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs, reduce]);

  const transition = useMemo(
    () => ({ duration: fadeMs / 1000, ease: [0.22, 1, 0.36, 1] as const }),
    [fadeMs]
  );

  return (
    <div
      className="relative mx-auto"
      style={{
        width: responsiveSize,
        aspectRatio: "1 / 1",
      }}
    >
      {/* Frame */}
      <div
        className={`absolute inset-0 ${cfg.wrapper}`}
        style={cfg.shadow ? { boxShadow: cfg.shadow } : undefined}
      >
        {/* Outer gold/wood border */}
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
          {/* Subtle metallic noise overlay (antique gold only) */}
          {variant === "antiqueGold" && (
            <div
              className="absolute inset-0 rounded-[10px] opacity-[0.04] mix-blend-multiply"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              }}
              aria-hidden
            />
          )}
          {/* Inner bevel */}
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
          {/* Matte (passepartout) */}
          <div
            className="relative h-full w-full rounded-[10px]"
            style={{
              padding: cfg.mattePadding,
              borderRadius: cfg.innerRadius,
              background: cfg.matteBg,
              boxShadow: cfg.matteShadow,
            }}
          >
            {/* Inner dark line (antiqueGold only) */}
            <div
              className="relative h-full w-full overflow-hidden"
              style={{
                borderRadius: cfg.imageRadius || 2,
                ...(variant === "antiqueGold" && {
                  border: "1px solid rgba(0,0,0,0.35)",
                }),
              }}
            >
              {/* Image window */}
              <div
                className="relative h-full w-full overflow-hidden"
                style={{
                  borderRadius: variant === "antiqueGold" ? 1 : cfg.imageRadius,
                  backgroundColor:
                    variant === "antiqueGold" ? "#FBF4E6" : "#f5f5f0",
                }}
              >
                {/* Film grain over image */}
                <div
                  className="pointer-events-none absolute inset-0 z-10 opacity-[0.06] mix-blend-soft-light"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
                  }}
                  aria-hidden
                />

                {/* Crossfade stack - portrait */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: reduce ? 1 : showB ? 0 : 1 }}
                  transition={transition}
                  style={{
                    filter: "contrast(1.06) saturate(1.03)",
                  }}
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

                {/* Crossfade stack - logo */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: reduce ? 0 : showB ? 1 : 0 }}
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
    </div>
  );
}
