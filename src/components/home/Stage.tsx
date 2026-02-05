"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/** Golden-ratio-inspired positions: balanced but asymmetric around center. Some cards layer behind typography. */
const CARD_POSITIONS: { top: number; left: number; z: number; swayPhase: number }[] = [
  { top: 22, left: 16, z: 5, swayPhase: 0 },
  { top: 20, left: 78, z: 5, swayPhase: 0.3 },
  { top: 42, left: 6, z: 4, swayPhase: 0.6 },
  { top: 48, left: 88, z: 4, swayPhase: 0.2 },
  { top: 72, left: 22, z: 5, swayPhase: 0.8 },
  { top: 76, left: 74, z: 5, swayPhase: 0.4 },
  { top: 38, left: 50, z: 2, swayPhase: 0.5 },
  { top: 62, left: 52, z: 2, swayPhase: 0.7 },
  { top: 84, left: 46, z: 5, swayPhase: 0.1 },
];

const NODES = [
  { href: "/cinema", label: "Cinema", mood: "noir" as const, word: "Directing" },
  { href: "/books", label: "Books", mood: "sepia" as const, word: "Poetry" },
  { href: "/projects", label: "Projects", mood: "tech" as const, word: "Build" },
  { href: "/posts", label: "Posts", mood: "neutral" as const, word: "Notes" },
  { href: "/translations", label: "Translations", mood: "neutral" as const, word: "Translate" },
  { href: "/home#ajanda", label: "Ajanda", mood: "cream" as const, word: "Journal" },
  { href: "/certificates", label: "Certificates", mood: "neutral" as const, word: "Achieve" },
  { href: "/art", label: "Art", mood: "neutral" as const, word: "Create" },
  { href: "/about", label: "About", mood: "neutral" as const, word: "Eymen" },
] as const;

type Mood = (typeof NODES)[number]["mood"];

/** Hover card background — category pastel */
const CARD_HOVER_BG: Record<Mood, string> = {
  noir: "rgba(26,26,28,0.08)",
  sepia: "rgba(200,180,140,0.15)",
  cream: "rgba(245,240,230,0.5)",
  tech: "rgba(220,235,250,0.4)",
  neutral: "rgba(250,248,245,0.6)",
};

export function Stage() {
  const containerRef = useRef<HTMLElement>(null);
  const [hoveredNode, setHoveredNode] = useState<(typeof NODES)[number] | null>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const spring = { stiffness: 50, damping: 25 };
  const smoothX = useSpring(mouseX, spring);
  const smoothY = useSpring(mouseY, spring);

  // Magnetic effect: stage bends opposite to mouse direction
  const stageTiltX = useTransform(smoothX, [0, 1], [4, -4]);
  const stageTiltY = useTransform(smoothY, [0, 1], [4, -4]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    setHoveredNode(null);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[#F9F9F9]"
    >
      {/* Very soft 2% grain */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
          mixBlendMode: "multiply",
        }}
      />

      {/* Radial vignette — corners to center */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.04) 100%)",
        }}
      />

      {/* Category word — large faded on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{
          opacity: hoveredNode ? 0.06 : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <span
          className="font-display text-[min(18vw,220px)] font-light tracking-tight text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {hoveredNode?.word ?? ""}
        </span>
      </motion.div>

      {/* Stage content — magnetic tilt */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          x: stageTiltX,
          y: stageTiltY,
        }}
      >
        {/* Hero typography */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-8xl font-normal tracking-tight text-[var(--foreground)] md:text-9xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Eymen
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-2 text-[11px] font-extralight uppercase tracking-[0.5em] text-[var(--muted)]"
          >
            Plaktaki Kitap
          </motion.p>
        </div>

        {/* Floating glass cards */}
        {NODES.map((node, i) => {
          const pos = CARD_POSITIONS[i] ?? { top: 50, left: 50, z: 5, swayPhase: 0 };
          const isHovered = hoveredNode?.href === node.href;
          const magFactor = 8 + pos.z * 3;

          return (
            <FloatingCard
              key={node.href}
              node={node}
              top={pos.top}
              left={pos.left}
              z={pos.z}
              swayPhase={pos.swayPhase}
              smoothX={smoothX}
              smoothY={smoothY}
              magFactor={magFactor}
              isHovered={isHovered}
              onHoverStart={() => setHoveredNode(node)}
              onHoverEnd={() => setHoveredNode(null)}
            />
          );
        })}
      </motion.div>
    </section>
  );
}

function FloatingCard({
  node,
  top,
  left,
  z,
  swayPhase,
  smoothX,
  smoothY,
  magFactor,
  isHovered,
  onHoverStart,
  onHoverEnd,
}: {
  node: (typeof NODES)[number];
  top: number;
  left: number;
  z: number;
  swayPhase: number;
  smoothX: ReturnType<typeof useSpring>;
  smoothY: ReturnType<typeof useSpring>;
  magFactor: number;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const magX = useTransform(smoothX, [0, 1], [-magFactor, magFactor]);
  const magY = useTransform(smoothY, [0, 1], [-magFactor, magFactor]);

  const hoverBg = isHovered ? CARD_HOVER_BG[node.mood] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.04 * NODES.indexOf(node), duration: 0.4 }}
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        zIndex: z,
        x: magX,
        y: magY,
        transform: "translate(-50%, -50%)",
      }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      <Link href={node.href}>
        <motion.div
          layoutId={`nav-${node.href}`}
          layout
          animate={{
            scale: isHovered ? 1.06 : 1,
            backgroundColor: hoverBg ?? "rgba(255,255,255,0.4)",
            boxShadow: isHovered
              ? "0 12px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.8)"
              : "0 4px 24px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.6)",
            y: [0, -6, 0],
          }}
          transition={{
            scale: { duration: 0.25 },
            backgroundColor: { duration: 0.3 },
            boxShadow: { duration: 0.25 },
            y: {
              duration: 7 + swayPhase * 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="flex items-center justify-center rounded-xl border border-white/80 px-5 py-2.5 backdrop-blur-md"
        >
          <span className="text-sm font-medium text-[var(--foreground)]">
            {node.label}
          </span>
        </motion.div>
      </Link>
    </motion.div>
  );
}
