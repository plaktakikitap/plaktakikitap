"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Badge = { id: string; title: string; image_url: string; link_url: string; order_index: number };

export function WorksBadges({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="mb-6 font-editorial text-2xl font-medium text-white sm:text-3xl">
        Sertifikalar
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-6">
        {badges.map((b, i) => {
          const content = (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{
                scale: 1.08,
                boxShadow: "0 0 24px rgba(212,175,55,0.4), 0 0 48px rgba(212,175,55,0.2)",
              }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm transition-shadow"
            >
              {b.image_url ? (
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-2xl sm:h-16 sm:w-16">
                  🏆
                </div>
              )}
              <span className="max-w-[100px] text-center text-xs font-medium text-white/90">
                {b.title}
              </span>
            </motion.div>
          );
          if (b.link_url) {
            return (
              <Link
                key={b.id}
                href={b.link_url}
                target="_blank"
                rel="noreferrer"
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050A14]"
              >
                {content}
              </Link>
            );
          }
          return <div key={b.id}>{content}</div>;
        })}
      </div>
    </section>
  );
}
