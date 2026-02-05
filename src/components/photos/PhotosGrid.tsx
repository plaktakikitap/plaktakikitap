"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Photo } from "@/types/photos";
import { PhotoLightbox, type PhotoLightboxItem } from "./PhotoLightbox";

export type PhotoCategoryFilter = "analog" | "digital" | "other" | null;

function matchesCategory(photo: Photo, category: PhotoCategoryFilter): boolean {
  if (!category) return true;
  const t = photo.type?.toLowerCase();
  if (category === "analog") return t === "analog";
  if (category === "digital") return t === "digital";
  if (category === "other") return t === "other" || !t; // null/legacy → other
  return true;
}

/** Format ISO date as dd.mm.yyyy */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return "";
  }
}

function displayDate(photo: Photo): string {
  if (photo.shot_at) return formatDate(photo.shot_at);
  return formatDate(photo.created_at);
}

interface PhotosGridProps {
  photos: Photo[];
  categoryFilter?: PhotoCategoryFilter;
}

export function PhotosGrid({ photos, categoryFilter = null }: PhotosGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return photos.filter((p) => matchesCategory(p, categoryFilter));
  }, [photos, categoryFilter]);

  const lightboxItems: PhotoLightboxItem[] = useMemo(
    () =>
      filtered.map((p) => ({
        id: p.id,
        image_url: p.image_url,
        caption: p.caption ?? null,
        shot_at: p.shot_at ?? null,
        created_at: p.created_at,
      })),
    [filtered]
  );

  return (
    <>
      {filtered.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="py-16 text-center text-white/60"
        >
          Bu filtreye uygun fotoğraf yok.
        </motion.p>
      ) : (
        <div
          className="columns-2 gap-3"
          style={{ columnGap: "12px" }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((photo) => (
              <motion.figure
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, opacity: { duration: 0.18 } }}
                className="group mb-3 break-inside-avoid"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(filtered.findIndex((p) => p.id === photo.id))}
                  className="block w-full text-left"
                >
                  <span className="block overflow-hidden rounded-xl transition-all duration-200 group-hover:-translate-y-0.5 group-hover:opacity-95">
                    <img
                      src={photo.image_url}
                      alt={photo.caption || "Fotoğraf"}
                      className="w-full rounded-xl"
                      style={{ display: "block", verticalAlign: "middle" }}
                      sizes="50vw"
                    />
                  </span>
                </button>
                <figcaption className="mt-1.5 flex min-w-0 items-center justify-between gap-2 px-0.5 text-[11px] tracking-wide text-white/30 transition-opacity duration-200 md:group-hover:text-white/60">
                  <span className="min-w-0 truncate">
                    {photo.caption?.trim() || "\u00A0"}
                  </span>
                  <span className="shrink-0">{displayDate(photo)}</span>
                </figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </div>
      )}

      <PhotoLightbox
        open={lightboxIndex !== null}
        index={lightboxIndex ?? 0}
        items={lightboxItems}
        onClose={() => setLightboxIndex(null)}
        onPrev={() =>
          setLightboxIndex((prev) =>
            prev === null ? null : prev === 0 ? lightboxItems.length - 1 : prev - 1
          )
        }
        onNext={() =>
          setLightboxIndex((prev) =>
            prev === null ? null : (prev + 1) % lightboxItems.length
          )
        }
      />
    </>
  );
}
