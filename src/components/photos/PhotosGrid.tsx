"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { Photo } from "@/types/photos";
import {
  CATEGORY_BADGE_COLORS,
  formatPhotoGear,
  resolvePhotoCategory,
} from "@/types/photos";
import type { PhotoLightboxItem } from "./PhotoLightbox";
import { PhotoImage } from "./PhotoImage";

const PhotoLightbox = dynamic(
  () => import("./PhotoLightbox").then((m) => ({ default: m.PhotoLightbox })),
  { ssr: false }
);

export type PhotoCategoryFilter = "analog" | "digital" | "other" | "dijital" | "diğer" | null;

function matchesCategory(photo: Photo, category: PhotoCategoryFilter): boolean {
  if (!category) return true;
  const resolved = resolvePhotoCategory(photo);
  if (category === "analog") return resolved === "analog";
  if (category === "digital" || category === "dijital") return resolved === "dijital";
  if (category === "other" || category === "diğer") return resolved === "diğer";
  return true;
}

/** Format ISO date as dd.mm.yyyy */
function formatDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
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
        camera: p.camera ?? null,
        lens: p.lens ?? null,
        film: p.film ?? null,
      })),
    [filtered]
  );

  /** Yükleme sırasına göre: 1. sağda, 2. solda, 3. sağda, 4. solda... */
  const { rightCol, leftCol } = useMemo(() => {
    const right = filtered.filter((_, i) => i % 2 === 0);
    const left = filtered.filter((_, i) => i % 2 === 1);
    return { rightCol: right, leftCol: left };
  }, [filtered]);

  const renderPhoto = (photo: Photo, lightboxIdx: number) => {
    const category = resolvePhotoCategory(photo);
    const isAnalog = category === "analog";
    const gear = formatPhotoGear(photo);
    const date = displayDate(photo);

    return (
      <motion.figure
        key={photo.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="group mb-3"
      >
        <button
          type="button"
          onClick={() => setLightboxIndex(lightboxIdx)}
          className="block w-full text-left"
        >
          <span className={isAnalog ? "photo-film-strip" : "relative block overflow-hidden rounded-xl"}>
            {isAnalog ? (
              <span className="photo-film-strip-label" aria-hidden="true">
                ANALOG
              </span>
            ) : null}
            <span className={isAnalog ? "relative block overflow-hidden" : "relative block"}>
              <PhotoImage
                src={photo.image_url}
                alt={photo.caption || "Fotoğraf"}
                width={600}
                height={800}
                className="photo-card-image w-full"
                sizes="50vw"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEEA/ALvaWVfFb0oNsAjIx/MV0P/Z"
              />
              <span className="photo-card-overlay" aria-hidden="true">
                <span
                  className="photo-card-badge"
                  style={{ backgroundColor: CATEGORY_BADGE_COLORS[category] }}
                >
                  {category}
                </span>
                <span className="photo-card-overlay-date">{date}</span>
              </span>
            </span>
          </span>
        </button>
        <figcaption className="mt-1.5 flex min-w-0 items-center justify-between gap-2 px-0.5 text-[11px] tracking-wide text-ink-muted/70 transition-opacity duration-200 md:group-hover:text-ink-muted">
          <span className="min-w-0 truncate">
            {photo.caption?.trim() || "\u00A0"}
          </span>
          <span className="shrink-0">{date}</span>
        </figcaption>
        {gear ? <p className="photo-card-gear">{gear}</p> : null}
      </motion.figure>
    );
  };

  return (
    <>
      {filtered.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="py-16 text-center text-ink/60"
        >
          Bu filtreye uygun fotoğraf yok.
        </motion.p>
      ) : (
        <div className="grid grid-cols-2 gap-x-3">
          {/* Sol sütun: 2., 4., 6. ... fotoğraf */}
          <div className="flex flex-col">
            {leftCol.map((photo, i) => renderPhoto(photo, i * 2 + 1))}
          </div>
          {/* Sağ sütun: 1., 3., 5. ... fotoğraf */}
          <div className="flex flex-col">
            {rightCol.map((photo, i) => renderPhoto(photo, i * 2))}
          </div>
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
