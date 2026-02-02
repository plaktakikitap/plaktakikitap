"use client";

import { motion } from "framer-motion";
import FramedCrossfade from "./FramedCrossfade";

interface HeroProps {
  portraitUrl?: string | null;
  logoUrl?: string | null;
}

export function Hero({ portraitUrl, logoUrl }: HeroProps) {
  const hasPortrait = !!portraitUrl?.trim();
  const hasLogo = !!logoUrl?.trim();
  const hasTwoImages = hasPortrait && hasLogo;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16"
    >
      {/* Centered framed crossfade or fallback */}
      {hasTwoImages ? (
        <FramedCrossfade
          aSrc={portraitUrl!}
          bSrc={logoUrl!}
          size={220}
          intervalMs={4000}
          fadeMs={1400}
          altA="Eymen"
          altB="Plaktaki Kitap logo"
        />
      ) : (
        <div className="relative aspect-square w-48 overflow-hidden rounded-lg md:w-64">
          {hasPortrait ? (
            <img
              src={portraitUrl!}
              alt="Eymen"
              className="h-full w-full object-cover"
            />
          ) : hasLogo ? (
            <div className="flex h-full w-full items-center justify-center bg-[var(--card)]">
              <img
                src={logoUrl!}
                alt="Plaktaki Kitap"
                className="max-h-full max-w-full object-contain p-4"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card)]">
              <span
                className="font-display text-5xl font-light text-[var(--muted)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                E
              </span>
            </div>
          )}
        </div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-8 text-center font-display text-3xl font-normal tracking-tight text-[var(--foreground)] md:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Hoş geldiniz, ben Eymen
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mt-2 text-sm text-[var(--muted)]"
      >
        namı diğer Plaktaki Kitap
      </motion.p>
    </motion.section>
  );
}
