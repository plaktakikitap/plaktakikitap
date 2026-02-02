"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  stats?: { label: string; value: string | number }[];
}

interface SlideProps {
  data: SlideData;
  isActive: boolean;
  reducedMotion?: boolean;
}

export function Slide({ data, isActive, reducedMotion }: SlideProps) {
  return (
    <section
        className="relative flex min-h-screen min-w-0 shrink-0 snap-start snap-always items-center justify-center px-6 py-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={
              isActive
                ? { opacity: 1, y: 0 }
                : reducedMotion
                  ? {}
                  : { opacity: 0.4, y: 8 }
            }
            transition={{ duration: 0.4 }}
            className="font-display text-5xl font-normal tracking-tight text-[var(--foreground)] md:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.title}
          </motion.h2>
          <motion.p
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={
              isActive
                ? { opacity: 1 }
                : reducedMotion
                  ? {}
                  : { opacity: 0.3 }
            }
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4 font-sans text-base text-[var(--muted)] md:text-lg"
          >
            {data.subtitle}
          </motion.p>
          {data.stats && data.stats.length > 0 && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={
                isActive
                  ? { opacity: 1 }
                  : reducedMotion
                    ? {}
                    : { opacity: 0.3 }
              }
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-8 flex flex-wrap justify-center gap-6 md:gap-10"
            >
              {data.stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-2xl font-medium text-[var(--foreground)] md:text-3xl">
                    {s.value}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={
              isActive
                ? { opacity: 1 }
                : reducedMotion
                  ? {}
                  : { opacity: 0.3 }
            }
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-10"
          >
            <Link
              href={data.href}
              className="inline-block rounded-md border border-[var(--foreground)]/30 bg-[var(--foreground)]/5 px-6 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)]/10 hover:border-[var(--foreground)]/50"
            >
              Aç
            </Link>
          </motion.div>
        </div>
      </section>
  );
}
