"use client";

import { motion } from "framer-motion";

interface DotsProps {
  total: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function Dots({ total, activeIndex, onSelect }: DotsProps) {
  return (
    <div
      className="fixed right-6 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-3"
      role="tablist"
      aria-label="Slide navigation"
    >
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to slide ${i + 1}`}
            className="group flex flex-col items-center"
          >
            <motion.span
              className="h-2 w-2 rounded-full transition-colors"
              animate={{
                backgroundColor: isActive
                  ? "var(--foreground)"
                  : "var(--muted)",
                scale: isActive ? 1.2 : 1,
              }}
              whileHover={{ scale: 1.3 }}
              transition={{ duration: 0.2 }}
              style={{
                opacity: isActive ? 1 : 0.5,
              }}
            />
            <span className="sr-only">Slide {i + 1}</span>
          </button>
        );
      })}
    </div>
  );
}
