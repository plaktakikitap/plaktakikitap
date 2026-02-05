"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import type { Photo } from "@/types/photos";
import { PhotosGrid, type PhotoCategoryFilter } from "./PhotosGrid";

interface PhotosContentProps {
  photos: Photo[];
}

const FILTER_OPTIONS: { value: PhotoCategoryFilter; label: string }[] = [
  { value: "analog", label: "analog" },
  { value: "digital", label: "dijital" },
  { value: "other", label: "diğer" },
  { value: null, label: "tümü" },
];

export function PhotosContent({ photos }: PhotosContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategoryState] = useState<PhotoCategoryFilter>(null);

  const typeParam = searchParams.get("type");
  useEffect(() => {
    if (typeParam === "analog" || typeParam === "digital" || typeParam === "other") {
      setCategoryState(typeParam);
    } else {
      setCategoryState(null);
    }
  }, [typeParam]);

  const setCategory = useCallback(
    (value: PhotoCategoryFilter) => {
      setCategoryState(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("type", value);
      else params.delete("type");
      const q = params.toString();
      router.replace(q ? `/photos?${q}` : "/photos", { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="font-editorial text-3xl font-semibold text-white sm:text-4xl">
          Fotoğraf
        </h1>
        <p className="mt-2 text-sm text-white/60">
          sadece gördüğüm şeyleri kalıcı hale getirmeyi ve detaylara bakmayı, fark etmiş olmayı seviyorum.
        </p>
        {photos.length > 0 && (
          <div className="mt-3 flex justify-end gap-3 text-[11px] tracking-wide text-white/40">
            {FILTER_OPTIONS.map(({ value, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => setCategory(value)}
                className={`transition-colors hover:text-white/60 ${
                  category === value
                    ? "text-white/80 underline underline-offset-2"
                    : ""
                }`}
              >
                #{label}
              </button>
            ))}
          </div>
        )}
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        {photos.length === 0 ? (
          <p className="py-16 text-center text-white/60">
            Henüz fotoğraf eklenmemiş.
          </p>
        ) : (
          <PhotosGrid photos={photos} categoryFilter={category} />
        )}
      </motion.div>
    </div>
  );
}
