"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Film, Tv } from "lucide-react";

const CHOICES = [
  {
    href: "/izleme-gunlugum/filmler",
    title: "Filmler",
    subtitle: "izlediğim filmler ve yorumlarım",
    Icon: Film,
  },
  {
    href: "/izleme-gunlugum/diziler",
    title: "Diziler",
    subtitle: "izlediğim diziler ve yorumlarım",
    Icon: Tv,
  },
] as const;

export function WatchLogChoice() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6">
      {CHOICES.map(({ href, title, subtitle, Icon }) => (
        <motion.div
          key={href}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          <Link
            href={href}
            className="flex h-full min-h-[11rem] flex-col items-center justify-center rounded-2xl border border-ink/10 bg-ink/5 px-6 py-10 text-center backdrop-blur-sm transition hover:border-amber-400/30 hover:bg-white/10 sm:min-h-[14rem]"
          >
            <Icon className="mb-4 h-8 w-8 text-gold" strokeWidth={1.4} />
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
