"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

const PARALLAX_SCALE = 620;
const MOBILE_MQ = "(max-width: 768px)";
const SCROLL_LAYER_END = 0.25;

const LAYERS = {
  window: 0.02,
  bookshelf: 0.04,
  turntable: 0.06,
  dust: 0.08,
} as const;

function ParallaxLayer({
  depth,
  offset,
  parallaxEnabled,
  className,
  children,
}: {
  depth: number;
  offset: { x: number; y: number };
  parallaxEnabled: boolean;
  className?: string;
  children: ReactNode;
}) {
  const style: CSSProperties | undefined = parallaxEnabled
    ? {
        transform: `translate(${offset.x * depth * PARALLAX_SCALE}px, ${offset.y * depth * PARALLAX_SCALE}px)`,
        transition: "transform 0.3s ease-out",
      }
    : undefined;

  return (
    <div className={cn("absolute inset-0", className)} style={style}>
      {children}
    </div>
  );
}

function ScrollLayerMotion({
  scrollYProgress,
  isMobile,
  xRange,
  yRange,
  children,
}: {
  scrollYProgress: MotionValue<number>;
  isMobile: boolean;
  xRange?: [number, number];
  yRange?: [number, number];
  children: ReactNode;
}) {
  const mobileOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scrollX = useTransform(
    scrollYProgress,
    [0, SCROLL_LAYER_END],
    xRange ?? [0, 0]
  );
  const scrollY = useTransform(
    scrollYProgress,
    [0, SCROLL_LAYER_END],
    yRange ?? [0, 0]
  );
  const scrollOpacity = useTransform(
    scrollYProgress,
    [0, SCROLL_LAYER_END],
    [1, 0]
  );

  if (isMobile) {
    return (
      <motion.div className="absolute inset-0" style={{ opacity: mobileOpacity }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: xRange ? scrollX : 0,
        y: yRange ? scrollY : 0,
        opacity: scrollOpacity,
      }}
    >
      {children}
    </motion.div>
  );
}

function ScrollLayer({
  scrollYProgress,
  scrollEffectsEnabled,
  isMobile,
  xRange,
  yRange,
  children,
}: {
  scrollYProgress?: MotionValue<number>;
  scrollEffectsEnabled: boolean;
  isMobile: boolean;
  xRange?: [number, number];
  yRange?: [number, number];
  children: ReactNode;
}) {
  if (!scrollEffectsEnabled || !scrollYProgress) {
    return <div className="absolute inset-0">{children}</div>;
  }

  return (
    <ScrollLayerMotion
      scrollYProgress={scrollYProgress}
      isMobile={isMobile}
      xRange={xRange}
      yRange={yRange}
    >
      {children}
    </ScrollLayerMotion>
  );
}


function WindowSilhouette() {
  return (
    <svg
      viewBox="0 0 120 140"
      className="absolute left-[3%] top-[6%] h-auto w-[min(26vw,190px)]"
      fill="none"
      aria-hidden
    >
      <rect
        x="8"
        y="8"
        width="104"
        height="124"
        stroke="rgba(232,220,192,0.04)"
        strokeWidth="1"
      />
      <line
        x1="60"
        y1="8"
        x2="60"
        y2="132"
        stroke="rgba(232,220,192,0.035)"
        strokeWidth="1"
      />
      <line
        x1="8"
        y1="70"
        x2="112"
        y2="70"
        stroke="rgba(232,220,192,0.035)"
        strokeWidth="1"
      />
      <line
        x1="8"
        y1="38"
        x2="112"
        y2="38"
        stroke="rgba(232,220,192,0.025)"
        strokeWidth="0.75"
      />
      <line
        x1="8"
        y1="102"
        x2="112"
        y2="102"
        stroke="rgba(232,220,192,0.025)"
        strokeWidth="0.75"
      />
    </svg>
  );
}

function BookshelfSilhouette() {
  const stroke = "rgba(201,166,90,0.06)";

  return (
    <svg
      viewBox="0 0 100 220"
      className="absolute right-[2%] top-[12%] h-auto w-[min(18vw,130px)]"
      fill="none"
      aria-hidden
    >
      <line x1="18" y1="12" x2="18" y2="208" stroke={stroke} strokeWidth="1" />
      <line x1="50" y1="12" x2="50" y2="208" stroke={stroke} strokeWidth="1" />
      <line x1="82" y1="12" x2="82" y2="208" stroke={stroke} strokeWidth="1" />
      <line x1="10" y1="12" x2="90" y2="12" stroke={stroke} strokeWidth="1" />
      <line x1="10" y1="72" x2="90" y2="72" stroke={stroke} strokeWidth="1" />
      <line x1="10" y1="132" x2="90" y2="132" stroke={stroke} strokeWidth="1" />
      <line x1="10" y1="192" x2="90" y2="192" stroke={stroke} strokeWidth="1" />

      <rect x="20" y="18" width="8" height="48" stroke={stroke} strokeWidth="1" />
      <rect x="30" y="22" width="6" height="44" stroke={stroke} strokeWidth="1" />
      <rect x="38" y="16" width="10" height="50" stroke={stroke} strokeWidth="1" />

      <rect x="22" y="78" width="7" height="46" stroke={stroke} strokeWidth="1" />
      <rect x="32" y="82" width="9" height="42" stroke={stroke} strokeWidth="1" />
      <rect x="44" y="76" width="5" height="48" stroke={stroke} strokeWidth="1" />

      <rect x="54" y="20" width="6" height="46" stroke={stroke} strokeWidth="1" />
      <rect x="62" y="24" width="8" height="42" stroke={stroke} strokeWidth="1" />
      <rect x="72" y="18" width="7" height="48" stroke={stroke} strokeWidth="1" />

      <rect x="56" y="80" width="9" height="44" stroke={stroke} strokeWidth="1" />
      <rect x="68" y="84" width="6" height="40" stroke={stroke} strokeWidth="1" />

      <rect x="24" y="140" width="8" height="44" stroke={stroke} strokeWidth="1" />
      <rect x="36" y="144" width="6" height="40" stroke={stroke} strokeWidth="1" />
      <rect x="58" y="138" width="10" height="46" stroke={stroke} strokeWidth="1" />
      <rect x="70" y="142" width="7" height="42" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}

function TurntableSilhouette() {
  const stroke = "rgba(201,166,90,0.08)";

  return (
    <svg
      viewBox="0 0 160 120"
      className="absolute bottom-[8%] left-[4%] h-auto w-[min(34vw,220px)]"
      fill="none"
      aria-hidden
    >
      <rect
        x="12"
        y="48"
        width="136"
        height="56"
        rx="3"
        stroke={stroke}
        strokeWidth="1"
      />
      <circle cx="72" cy="68" r="28" stroke={stroke} strokeWidth="1" />
      <circle cx="72" cy="68" r="8" stroke={stroke} strokeWidth="0.75" />
      <line
        x1="72"
        y1="40"
        x2="118"
        y2="52"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="72" cy="40" r="2.5" fill={stroke} />
      <circle cx="118" cy="52" r="3" stroke={stroke} strokeWidth="0.75" />
      <line x1="20" y1="56" x2="36" y2="56" stroke={stroke} strokeWidth="0.75" opacity="0.7" />
      <line x1="124" y1="56" x2="140" y2="56" stroke={stroke} strokeWidth="0.75" opacity="0.7" />
    </svg>
  );
}

type DustPoint = { x: number; y: number; r: number; opacity: number };

function createDustPoints(count: number): DustPoint[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.1 + 0.35,
    opacity: Math.random() * 0.12 + 0.04,
  }));
}

function DustCanvas({ points }: { points: DustPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 220, 192, ${p.opacity})`;
      ctx.fill();
    }
  }, [points]);

  useEffect(() => {
    draw();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden />
    </div>
  );
}

export default function RoomBackdrop({
  scrollYProgress,
  scrollEffectsEnabled = false,
}: {
  scrollYProgress?: MotionValue<number>;
  scrollEffectsEnabled?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const parallaxEnabled = !reduceMotion && !isMobile;
  const dustCount = isMobile ? 9 : 18;

  const dustPoints = useMemo(
    () => createDustPoints(dustCount),
    [dustCount]
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!parallaxEnabled) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const onMove = (event: MouseEvent) => {
      targetRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };

      if (rafRef.current != null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        setOffset({ ...targetRef.current });
        rafRef.current = null;
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [parallaxEnabled]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <ScrollLayer
        scrollYProgress={scrollYProgress}
        scrollEffectsEnabled={scrollEffectsEnabled}
        isMobile={isMobile}
        yRange={[0, -150]}
      >
        <ParallaxLayer
          depth={LAYERS.window}
          offset={offset}
          parallaxEnabled={parallaxEnabled}
        >
          <WindowSilhouette />
        </ParallaxLayer>
      </ScrollLayer>

      <ScrollLayer
        scrollYProgress={scrollYProgress}
        scrollEffectsEnabled={scrollEffectsEnabled}
        isMobile={isMobile}
        xRange={[0, 200]}
      >
        <ParallaxLayer
          depth={LAYERS.bookshelf}
          offset={offset}
          parallaxEnabled={parallaxEnabled}
        >
          <BookshelfSilhouette />
        </ParallaxLayer>
      </ScrollLayer>

      <ScrollLayer
        scrollYProgress={scrollYProgress}
        scrollEffectsEnabled={scrollEffectsEnabled}
        isMobile={isMobile}
        xRange={[0, -200]}
      >
        <ParallaxLayer
          depth={LAYERS.turntable}
          offset={offset}
          parallaxEnabled={parallaxEnabled}
        >
          <TurntableSilhouette />
        </ParallaxLayer>
      </ScrollLayer>

      <ScrollLayer
        scrollYProgress={scrollYProgress}
        scrollEffectsEnabled={scrollEffectsEnabled}
        isMobile={isMobile}
        yRange={[0, -80]}
      >
        <ParallaxLayer
          depth={LAYERS.dust}
          offset={offset}
          parallaxEnabled={parallaxEnabled}
        >
          <DustCanvas points={dustPoints} />
        </ParallaxLayer>
      </ScrollLayer>
    </div>
  );
}
