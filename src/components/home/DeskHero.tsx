"use client";

import { motion } from "framer-motion";

interface DeskHeroProps {
  portraitUrl?: string | null;
}

export function DeskHero({ portraitUrl }: DeskHeroProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="absolute left-4 top-4 z-10 md:left-8 md:top-8"
    >
      <div className="flex items-center gap-3">
        {portraitUrl ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="h-10 w-10 overflow-hidden rounded-full md:h-12 md:w-12"
          >
            <img src={portraitUrl} alt="" className="h-full w-full object-cover" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)]/5 md:h-12 md:w-12"
          >
            <span
              className="font-display text-lg font-light text-[var(--foreground)] md:text-xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              E
            </span>
          </motion.div>
        )}
        <div>
          <h1
            className="font-display text-xl font-normal tracking-tight text-[var(--foreground)] md:text-2xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Eymen
          </h1>
          <p className="text-xs text-[var(--muted)]">film · kitap · yazı</p>
        </div>
      </div>
    </motion.header>
  );
}
