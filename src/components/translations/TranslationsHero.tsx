"use client";

import { motion } from "framer-motion";
import type { TranslationsSettingsRow } from "@/types/database";

const glassStyle = {
  background:
    "linear-gradient(145deg, rgba(232,208,120,0.12) 0%, rgba(201,168,74,0.08) 30%, rgba(245,240,232,0.06) 60%, rgba(255,255,255,0.04) 100%)",
  boxShadow:
    "0 0 0 1px rgba(212,182,90,0.25), 0 0 40px -8px rgba(212,182,90,0.15), 0 8px 32px -8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)",
  backdropFilter: "blur(12px)",
};

export function TranslationsHero({ settings }: { settings: TranslationsSettingsRow | null }) {
  if (!settings?.intro_body?.trim()) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-14"
    >
      <div
        className="relative max-w-3xl rounded-xl px-6 py-8 sm:px-10 sm:py-10"
        style={glassStyle}
      >
        <div className="absolute inset-0 pointer-events-none rounded-xl border border-amber-400/20" aria-hidden />
        <div className="relative">
          {settings.intro_title && (
            <h2 className="font-editorial text-xl font-medium text-[var(--foreground)] sm:text-2xl mb-4">
              {settings.intro_title}
            </h2>
          )}
          <div className="font-serif text-base leading-relaxed text-[var(--foreground)] sm:text-lg max-w-none">
            {settings.intro_body.split("\n").map((p, i) => (
              <p key={i} className={i > 0 ? "mt-4" : ""}>
                {p}
              </p>
            ))}
          </div>
          {settings.intro_signature?.trim() && (
            <p
              className="mt-6 text-right text-lg text-amber-800/90 dark:text-amber-200/90"
              style={{ fontFamily: "var(--font-handwriting), cursive" }}
            >
              — {settings.intro_signature}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
