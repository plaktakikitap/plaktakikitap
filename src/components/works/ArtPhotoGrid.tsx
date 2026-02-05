"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { WorksItem } from "@/types/works";
import { Lightbox } from "./Lightbox";

const ROTATIONS = [-8, 4, -12, 6, -5, 10, -7, 3];

function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  return Math.abs(h);
}

function getRotation(item: WorksItem, index: number): number {
  const seed = typeof item.meta?.seed === "number" ? item.meta.seed : seedFromId(item.id);
  return ROTATIONS[Math.abs(seed) % ROTATIONS.length] ?? (seed % 20) - 10;
}

interface ArtPhotoGridProps {
  items: WorksItem[];
}

export function ArtPhotoGrid({ items }: ArtPhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const open = useCallback((i: number) => setLightboxIndex(i), []);
  const close = useCallback(() => setLightboxIndex(null), []);
  const goPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : i === 0 ? items.length - 1 : i - 1)),
    [items.length]
  );
  const goNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : i === items.length - 1 ? 0 : i + 1)),
    [items.length]
  );

  if (items.length === 0) return null;

  const lightboxItems = items.map((i) => ({
    image_url: i.image_url,
    title: i.title,
    meta: i.meta,
  }));

  return (
    <section className="mb-16">
      <h2 className="mb-6 font-editorial text-2xl font-medium text-white sm:text-3xl">
        Sanat & Fotoğraf
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-6 py-4">
        {items.map((item, i) => {
          if (!item.image_url) return null;
          const rot = getRotation(item, i);
          return (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              whileHover={{ scale: 1.03, zIndex: 10 }}
              onClick={() => open(i)}
              className="relative block overflow-hidden rounded-lg border-2 border-white/20 bg-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-shadow hover:border-amber-400/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
              style={{
                transform: `rotate(${rot}deg)`,
                width: 180,
                height: 220,
              }}
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              {(item.title || item.subtitle) && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-1.5 text-center text-xs text-white/90">
                  {item.subtitle || item.title}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <Lightbox
        open={lightboxIndex !== null}
        index={lightboxIndex ?? 0}
        items={lightboxItems}
        onClose={close}
        onPrev={goPrev}
        onNext={goNext}
      />
    </section>
  );
}
