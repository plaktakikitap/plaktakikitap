"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DecorLayer } from "./DecorLayer";
import type { PlannerDecor } from "@/lib/planner";

interface SheetProps {
  page: "left" | "right";
  children: React.ReactNode;
  flipKey: string;
  direction: "next" | "prev";
  decors: PlannerDecor[];
  roundedSide: "left" | "right";
  bindingShadow: "right" | "left";
}

/**
 * Tek sayfa: flip animasyonu + DecorLayer (içerikle birlikte flip eder)
 */
export function Sheet({
  page,
  children,
  flipKey,
  direction,
  decors,
  roundedSide,
  bindingShadow,
}: SheetProps) {
  // Sayfa çevirme: cilt kenarından pivot, 3D flip
  const isRight = page === "right";
  const flipOut = direction === "next" ? -165 : 165;
  const flipIn = direction === "next" ? 165 : -165;

  const initial = {
    rotateY: isRight ? flipIn : -flipIn,
    opacity: 1,
  };
  const animate = { rotateY: 0, opacity: 1 };
  const exit = {
    rotateY: isRight ? flipOut : -flipOut,
    opacity: 1,
  };

  const transformOrigin = isRight ? "left center" : "right center";

  const roundedClass = roundedSide === "left" ? "rounded-l-2xl" : "rounded-r-2xl";
  const shadowGradient =
    bindingShadow === "right"
      ? "linear-gradient(to right, rgba(0,0,0,0.1), transparent)"
      : "linear-gradient(to left, rgba(0,0,0,0.1), transparent)";
  const shadowPos = bindingShadow === "right" ? "right-0" : "left-0";

  return (
    <div
      className={`relative min-w-0 flex-1 overflow-visible ${roundedClass}`}
    >
      {/* Binding shadow */}
      <div
        className={`absolute ${shadowPos} top-0 z-[1] h-full w-8 shrink-0 ${
          bindingShadow === "right" ? "rounded-r-sm" : "rounded-l-sm"
        }`}
        style={{ background: shadowGradient }}
      />
      <div
        className="relative z-0 h-full min-h-[520px] overflow-visible"
        style={{ perspective: 1400 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={flipKey}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={{
              type: "spring",
              damping: 32,
              stiffness: 200,
              mass: 0.9,
            }}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin,
              backfaceVisibility: "hidden",
            }}
            className="relative h-full w-full"
          >
            {children}
            <DecorLayer page={page} decors={decors} useDemoFallback />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
