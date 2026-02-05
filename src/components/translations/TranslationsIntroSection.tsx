"use client";

import { motion } from "framer-motion";

interface TranslationsIntroSectionProps {
  text: string;
}

/** Gold & Glass themed intro frame for /translations – serif, subtle glow */
export function TranslationsIntroSection({ text }: TranslationsIntroSectionProps) {
  if (!text.trim()) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-12"
    >
      <div
        className="relative rounded-xl px-6 py-8 sm:px-10 sm:py-10"
        style={{
          background:
            "linear-gradient(145deg, rgba(232,208,120,0.12) 0%, rgba(201,168,74,0.08) 30%, rgba(245,240,232,0.06) 60%, rgba(255,255,255,0.04) 100%)",
          boxShadow:
            "0 0 0 1px rgba(212,182,90,0.25), 0 0 40px -8px rgba(212,182,90,0.15), 0 8px 32px -8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Subtle inner gold line */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(212,182,90,0.35)",
          }}
          aria-hidden
        />
        {/* Inner content */}
        <div className="relative">
          <p className="font-editorial text-lg leading-relaxed text-[var(--foreground)] sm:text-xl">
            {text}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
