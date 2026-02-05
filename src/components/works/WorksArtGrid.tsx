"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

function seededRotate(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const ROTATIONS = [-8, 4, -12, 6, -5, 10, -7, 3];

type Art = { id: string; image_url: string; caption: string; order_index: number };

export function WorksArtGrid({ items }: { items: Art[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="mb-6 font-editorial text-2xl font-medium text-white sm:text-3xl">
        Sanat & Fotoğraf
      </h2>
      <div className="relative flex flex-wrap items-center justify-center gap-6 py-4">
        {items.map((item, i) => {
          const rot = ROTATIONS[i % ROTATIONS.length] ?? seededRotate(i, -12, 12);
          return (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              onClick={() => setLightboxIndex(i)}
              className="relative block overflow-hidden rounded-lg border-2 border-white/20 bg-white/5 py-0 transition-shadow hover:border-amber-400/40"
              style={{ transform: "rotate(" + rot + "deg)", width: 180, height: 220 }}
            >
              <img src={item.image_url} alt={item.caption || ""} className="h-full w-full object-cover" />
              {item.caption && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-center text-xs text-white/90">
                  {item.caption}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Kapat"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={items[lightboxIndex].image_url}
                alt={items[lightboxIndex].caption || ""}
                className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
              />
              {items[lightboxIndex].caption && (
                <p className="mt-2 text-center text-sm text-white/80">{items[lightboxIndex].caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
