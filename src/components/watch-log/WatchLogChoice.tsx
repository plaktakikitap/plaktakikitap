"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CinemaProjector from "@/components/icons/CinemaProjector";
import RetroTV from "@/components/icons/RetroTV";

const CHOICES = [
  {
    href: "/izleme-gunlugum/filmler",
    title: "Filmler",
    subtitle: "izlediğim filmler ve yorumlarım",
    Visual: CinemaProjector,
  },
  {
    href: "/diziler",
    title: "Diziler",
    subtitle: "izlediğim diziler ve yorumlarım",
    Visual: RetroTV,
  },
] as const;

export function WatchLogChoice() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6">
      {CHOICES.map(({ href, title, subtitle, Visual }) => (
        <motion.div
          key={href}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          <Link
            href={href}
            className="watch-card flex h-full min-h-[11rem] flex-col items-center justify-center rounded-2xl border border-ink/10 bg-ink/5 px-6 py-10 text-center backdrop-blur-sm transition hover:border-amber-400/30 hover:bg-white/10 sm:min-h-[14rem]"
          >
            <div className="mb-4">
              <Visual />
            </div>
            <span className="font-editorial text-3xl font-medium text-ink sm:text-4xl">
              {title}
            </span>
            <span className="mt-2 text-sm text-ink/60">{subtitle}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
