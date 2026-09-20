"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type VinylIz = {
  id: string;
  baslik: string;
  /** Plağın üzerinde görünen kısa etiket */
  etiket: string;
  aciklama: string;
  url: string;
  baslangicAci: number;
};

/** Gerçek site rotaları (kullanıcı etiketleri korunur). */
export const IZLER: VinylIz[] = [
  {
    id: "beni-taniyin",
    baslik: "Beni Tanıyın",
    etiket: "Tanıyın",
    aciklama: "kimdir bu eymen?",
    url: "/beni-taniyin",
    baslangicAci: 0,
  },
  {
    id: "okuma",
    baslik: "Okuma Günlüğüm",
    etiket: "Okuma",
    aciklama: "altını çizdiklerim",
    url: "/okuma-gunlugum",
    baslangicAci: 45,
  },
  {
    id: "izleme",
    baslik: "İzleme Günlüğüm",
    etiket: "İzleme",
    aciklama: "filmler, diziler",
    url: "/izleme-gunlugum",
    baslangicAci: 90,
  },
  {
    id: "fotograflar",
    baslik: "Fotoğraflar",
    etiket: "Foto",
    aciklama: "gözümden dünya",
    url: "/photos",
    baslangicAci: 135,
  },
  {
    id: "yaptiklarim",
    baslik: "Yaptıklarım",
    etiket: "Yaptıklar",
    aciklama: "üretimler, projeler",
    url: "/yaptiklarim",
    baslangicAci: 180,
  },
  {
    id: "cevirilerim",
    baslik: "Çevirilerim",
    etiket: "Çeviriler",
    aciklama: "kitaplarım",
    url: "/translations",
    baslangicAci: 225,
  },
  {
    id: "karalamalar",
    baslik: "Karalamalar",
    etiket: "Karalama",
    aciklama: "kafama esen notlar",
    url: "/karalamalar",
    baslangicAci: 270,
  },
  {
    id: "yazilarim",
    baslik: "Yazılarım",
    etiket: "Yazılar",
    aciklama: "düşünceler, denemeler",
    url: "/writings",
    baslangicAci: 315,
  },
];

const SIZE = 500;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = SIZE * 0.475;
const INNER_R = SIZE * 0.15;
/** Label dairesi — logo için biraz daha geniş */
const LABEL_R = SIZE * 0.175;
const HOLE_R = SIZE * 0.016;
const SEGMENT = 45;
const AUTO_SPEED = 0.45;
const HOVER_SPEED = 0.04;
const DEFAULT_LABEL_LOGO = "/images/logo.png";
/** Kare logo daireyi doldursun diye çapın biraz üstü */
const LOGO_SIZE = LABEL_R * 2 * 1.18;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function createArcPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
) {
  const s1 = polarToCartesian(cx, cy, outerR, startAngle);
  const e1 = polarToCartesian(cx, cy, outerR, endAngle);
  const s2 = polarToCartesian(cx, cy, innerR, endAngle);
  const e2 = polarToCartesian(cx, cy, innerR, startAngle);
  return `M ${s1.x} ${s1.y} A ${outerR} ${outerR} 0 0 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${innerR} ${innerR} 0 0 0 ${e2.x} ${e2.y} Z`;
}

function grooveRadii(count = 28): number[] {
  const radii: number[] = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    radii.push(INNER_R + (OUTER_R - INNER_R) * t);
  }
  return radii;
}

/** İz adı — label dışındaki halkada, her zaman dik (okunaklı) */
function IzYazisi({
  angle,
  text,
  active,
}: {
  angle: number;
  text: string;
  active: boolean;
}) {
  const pos = polarToCartesian(CX, CY, LABEL_R + 28, angle);

  return (
    <text
      x={pos.x}
      y={pos.y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={active ? "#e8c878" : "rgba(245,235,215,0.95)"}
      fontSize={active ? 13 : 11}
      fontFamily="var(--font-display), Georgia, serif"
      fontWeight={600}
      letterSpacing="1.2"
      stroke="rgba(5,10,18,0.82)"
      strokeWidth={3.5}
      paintOrder="stroke fill"
      style={{ userSelect: "none", pointerEvents: "none" }}
    >
      {text.toUpperCase()}
    </text>
  );
}

export function VinylRecord({
  logoSrc = DEFAULT_LABEL_LOGO,
}: {
  logoSrc?: string | null;
} = {}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const labelLogo = logoSrc?.trim() || DEFAULT_LABEL_LOGO;

  const wrapRef = useRef<HTMLDivElement>(null);
  const rotateRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const speedRef = useRef(AUTO_SPEED);
  const targetSpeedRef = useRef(AUTO_SPEED);
  const playingRef = useRef(true);
  const tonearmLiftedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ angle: 0, rotation: 0 });
  const dragDeltaRef = useRef(0);
  const centerRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const hoveredRef = useRef<number | null>(null);

  const [hoveredIz, setHoveredIz] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [tonearmLifted, setTonearmLifted] = useState(false);

  const paths = useMemo(
    () =>
      IZLER.map((iz) => {
        const midAngle = iz.baslangicAci + SEGMENT / 2;
        return {
          ...iz,
          d: createArcPath(
            CX,
            CY,
            INNER_R,
            OUTER_R,
            iz.baslangicAci,
            iz.baslangicAci + SEGMENT
          ),
          midAngle,
        };
      }),
    []
  );

  const grooves = useMemo(() => grooveRadii(32), []);

  const updateCenter = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  const applyRotation = useCallback((deg: number) => {
    rotationRef.current = deg;
    if (rotateRef.current) {
      rotateRef.current.style.transform = `rotate(${deg}deg)`;
    }
  }, []);

  const getAngleFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      updateCenter();
      const { x: cx, y: cy } = centerRef.current;
      return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
    },
    [updateCenter]
  );

  const getHoveredIz = useCallback((mouseX: number, mouseY: number) => {
    const el = wrapRef.current;
    if (!el) return null;
    updateCenter();
    const { x: cx, y: cy } = centerRef.current;
    const rect = el.getBoundingClientRect();
    const plakYaricap = rect.width / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < plakYaricap * 0.3 || dist > plakYaricap * 0.95) return null;

    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    angle = (((angle - rotationRef.current) % 360) + 360) % 360;
    return Math.floor(angle / SEGMENT);
  }, [updateCenter]);

  const syncTargetSpeed = useCallback(
    (hovered: number | null) => {
      if (reduceMotion || !playingRef.current || tonearmLiftedRef.current) {
        targetSpeedRef.current = 0;
      } else if (hovered !== null) {
        targetSpeedRef.current = HOVER_SPEED;
      } else {
        targetSpeedRef.current = AUTO_SPEED;
      }
    },
    [reduceMotion]
  );

  // Otomatik dönme — hedef hıza yumuşak yaklaşma + CSS transform
  useEffect(() => {
    if (reduceMotion) {
      speedRef.current = 0;
      targetSpeedRef.current = 0;
    }
    const animate = () => {
      // ~1sn'de tam geçiş (0.016 lerp)
      speedRef.current +=
        (targetSpeedRef.current - speedRef.current) * 0.016;

      if (!isDraggingRef.current) {
        applyRotation(rotationRef.current + speedRef.current);
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [applyRotation, reduceMotion]);

  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    playingRef.current = playing;
    if (!playing) {
      targetSpeedRef.current = 0;
    }
    // playing true: hızı togglePlay'deki 600ms gecikme yönetir
  }, [playing]);

  useEffect(() => {
    tonearmLiftedRef.current = tonearmLifted;
    if (tonearmLifted) {
      targetSpeedRef.current = 0;
    }
  }, [tonearmLifted]);

  useEffect(() => {
    updateCenter();
    const onResize = () => updateCenter();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    };
  }, [updateCenter]);

  const setHover = useCallback(
    (index: number | null) => {
      if (hoveredRef.current === index) return;
      hoveredRef.current = index;
      setHoveredIz(index);
      syncTargetSpeed(index);
    },
    [syncTargetSpeed]
  );

  const togglePlay = useCallback(() => {
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }

    if (playing) {
      targetSpeedRef.current = 0;
      setTonearmLifted(true);
      setPlaying(false);
    } else {
      setTonearmLifted(false);
      setPlaying(true);
      targetSpeedRef.current = 0;
      // İğne 0.6sn'de yerine oturur, sonra hız başlar
      playTimeoutRef.current = setTimeout(() => {
        if (playingRef.current && !tonearmLiftedRef.current) {
          syncTargetSpeed(hoveredRef.current);
        }
        playTimeoutRef.current = null;
      }, 600);
    }
  }, [playing, syncTargetSpeed]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    setIsDragging(true);
    dragDeltaRef.current = 0;
    const angle = getAngleFromEvent(e.clientX, e.clientY);
    dragStartRef.current = { angle, rotation: rotationRef.current };
    setHover(null);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (isDraggingRef.current) {
      const angle = getAngleFromEvent(e.clientX, e.clientY);
      const delta = angle - dragStartRef.current.angle;
      dragDeltaRef.current = delta;
      applyRotation(dragStartRef.current.rotation + delta);
      return;
    }
    setHover(getHoveredIz(e.clientX, e.clientY));
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
  };

  const onPointerLeave = () => {
    if (!isDraggingRef.current) setHover(null);
  };

  const handleClick = (e: ReactMouseEvent) => {
    if (Math.abs(dragDeltaRef.current) > 5) {
      dragDeltaRef.current = 0;
      return;
    }
    const iz = getHoveredIz(e.clientX, e.clientY);
    if (iz !== null) router.push(IZLER[iz]!.url);
  };

  const cursor = isDragging
    ? "grabbing"
    : hoveredIz !== null
      ? "pointer"
      : "grab";

  const active = hoveredIz !== null ? IZLER[hoveredIz] : null;
  const motionDuration = reduceMotion ? 0 : 0.25;

  return (
    <div
      ref={wrapRef}
      className="vinyl-record select-none"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "transparent",
        cursor,
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
      onClick={handleClick}
      role="img"
      aria-label="Bölüm navigasyonu — plağı sürükleyerek döndürün, bir ize tıklayın"
    >
      {/* Dönen plak SVG */}
      <div
        ref={rotateRef}
        className="h-full w-full will-change-transform"
        style={{ transform: "rotate(0deg)" }}
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-full w-full"
          aria-hidden
        >
            <defs>
              <radialGradient id="vinyl-surface" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1a1612" />
                <stop offset="70%" stopColor="#100e0c" />
                <stop offset="100%" stopColor="#0d0b09" />
              </radialGradient>
              <radialGradient
                id="vinyl-highlight"
                cx="32%"
                cy="28%"
                r="55%"
              >
                <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0.015)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
              <radialGradient id="vinyl-vignette" cx="50%" cy="50%" r="50%">
                <stop offset="85%" stopColor="transparent" />
                <stop offset="100%" stopColor="#0a0908" />
              </radialGradient>
              <filter
                id="vinyl-glow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="4"
                  floodColor="rgba(201,166,90,0.65)"
                />
              </filter>
              <filter
                id="vinyl-label-glow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="2.5"
                  floodColor="rgba(201,166,90,0.6)"
                />
              </filter>
              <clipPath id="labelClip">
                <circle cx={CX} cy={CY} r={LABEL_R - 2} />
              </clipPath>
              <radialGradient id="labelGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(192,160,96,0.15)" />
                <stop offset="100%" stopColor="rgba(192,160,96,0)" />
              </radialGradient>
            </defs>

            {/* Dış kenar */}
            <circle
              cx={CX}
              cy={CY}
              r={OUTER_R + 6}
              fill="#0d0b09"
              stroke="rgba(201,166,90,0.45)"
              strokeWidth="1.5"
            />
            <circle cx={CX} cy={CY} r={OUTER_R} fill="url(#vinyl-surface)" />

            {/* Groove çizgileri */}
            {grooves.map((r) => (
              <circle
                key={r}
                cx={CX}
                cy={CY}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.3"
              />
            ))}

            {/* 8 iz dilimi */}
            {paths.map((iz, i) => {
              const isActive = hoveredIz === i;
              return (
                <path
                  key={iz.id}
                  d={iz.d}
                  fill={
                    isActive
                      ? "rgba(201,166,90,0.12)"
                      : i % 2 === 0
                        ? "rgba(255,255,255,0.015)"
                        : "rgba(0,0,0,0.12)"
                  }
                  stroke={
                    isActive
                      ? "rgba(201,166,90,0.55)"
                      : "rgba(201,166,90,0.08)"
                  }
                  strokeWidth={isActive ? 1.2 : 0.4}
                  filter={isActive ? "url(#vinyl-glow)" : undefined}
                  style={{ transition: "fill 0.2s ease, stroke 0.2s ease" }}
                />
              );
            })}

            {/* Yansıma */}
            <circle cx={CX} cy={CY} r={OUTER_R} fill="url(#vinyl-highlight)" />
            <circle cx={CX} cy={CY} r={OUTER_R} fill="url(#vinyl-vignette)" />

            {/* İz yazıları — label dışı, radyal */}
            {paths.map((iz, i) => (
              <IzYazisi
                key={`label-${iz.id}`}
                angle={iz.midAngle}
                text={iz.etiket}
                active={hoveredIz === i}
              />
            ))}

            {/* Label — logo, plakla birlikte döner */}
            <circle
              cx={CX}
              cy={CY}
              r={LABEL_R}
              fill="#1a1200"
              stroke="#c0a060"
              strokeWidth="2"
            />
            <image
              href={labelLogo}
              x={CX - LOGO_SIZE / 2}
              y={CY - LOGO_SIZE / 2}
              width={LOGO_SIZE}
              height={LOGO_SIZE}
              clipPath="url(#labelClip)"
              preserveAspectRatio="xMidYMid slice"
            />
            <circle cx={CX} cy={CY} r={LABEL_R - 2} fill="url(#labelGlow)" />
            <circle
              cx={CX}
              cy={CY}
              r={LABEL_R}
              fill="none"
              stroke="#c0a060"
              strokeWidth="2.5"
            />
            <circle cx={CX} cy={CY} r={HOLE_R + 3} fill="#c0a060" />
            <circle cx={CX} cy={CY} r={HOLE_R} fill="#1a1200" />
          </svg>
        </div>

        {/* Pikap İğnesi — plakla dönmez */}
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              togglePlay();
            }
          }}
          style={{
            position: "absolute",
            /* Görünen üst yarının sağ kenarı — plağın üzerinde */
            top: "6%",
            left: "62%",
            width: "18%",
            height: "52%",
            cursor: "pointer",
            zIndex: 20,
            transformOrigin: "18% 8%",
            transform: tonearmLifted ? "rotate(-28deg)" : "rotate(-8deg)",
            transition: reduceMotion
              ? "none"
              : "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          title={playing ? "Duraklat" : "Oynat"}
          aria-label={playing ? "Plağı duraklat" : "Plağı oynat"}
        >
          <svg
            viewBox="0 0 60 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
            aria-hidden
          >
            <defs>
              <linearGradient
                id="tonearmGrad"
                x1="11"
                y1="18"
                x2="22"
                y2="18"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#d4b870" />
                <stop offset="50%" stopColor="#f0e0a0" />
                <stop offset="100%" stopColor="#b09050" />
              </linearGradient>
            </defs>
            <circle
              cx="11"
              cy="11"
              r="9"
              fill="#c0a060"
              stroke="#8a7040"
              strokeWidth="1.5"
            />
            <circle cx="11" cy="11" r="4" fill="#6a5030" />
            <path
              d="M11 18 L18 170 L22 175 L18 178 L14 175 L11 170 Z"
              fill="url(#tonearmGrad)"
              stroke="#8a7040"
              strokeWidth="0.8"
            />
            <ellipse
              cx="16"
              cy="177"
              rx="3"
              ry="5"
              fill="#e0d0a0"
              stroke="#8a7040"
              strokeWidth="0.8"
            />
          </svg>
        </div>

      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: motionDuration }}
            className="pointer-events-none fixed right-[4%] top-1/2 z-30 hidden -translate-y-1/2 text-right md:block"
          >
            <div
              className="font-editorial text-[1.8rem] font-normal leading-tight"
              style={{ color: "#f3ead9" }}
            >
              {active.baslik}
            </div>
            <div
              className="mt-1.5 text-[0.85rem]"
              style={{ color: "#9a9488" }}
            >
              {active.aciklama}
            </div>
            <div
              className="mt-3 text-[0.65rem] uppercase tracking-[0.18em]"
              style={{ color: "rgba(201,166,90,0.7)" }}
            >
              tıkla · aç
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
