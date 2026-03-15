"use client";

import { motion } from "framer-motion";

/** Hafif skeleton – grid düzenini bozmadan kısa yükleme anında gösterilir */
export function PhotosPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-10 animate-pulse text-center">
        <div className="mx-auto h-9 w-48 rounded bg-white/10 sm:h-10 sm:w-56" />
        <div className="mx-auto mt-2 h-4 max-w-md rounded bg-white/5" />
        <div className="mt-3 flex justify-end gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-12 rounded bg-white/5" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            className="mb-3"
          >
            <div className="aspect-[3/4] w-full rounded-xl bg-white/5" />
            <div className="mt-1.5 flex gap-2 px-0.5">
              <div className="h-3 flex-1 rounded bg-white/5" />
              <div className="h-3 w-16 shrink-0 rounded bg-white/5" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
