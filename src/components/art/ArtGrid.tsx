"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ArtItem } from "@/lib/db/queries";
import { getVideoEmbedUrl } from "@/lib/utils/embed";
import { ImageIcon, Palette } from "lucide-react";

function MediaThumb({ item }: { item: ArtItem }) {
  const firstMedia = item.media[0];
  if (!firstMedia) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-[var(--card-border)]">
        <Palette className="h-12 w-12 text-[var(--muted)]" />
      </div>
    );
  }

  const embedUrl = getVideoEmbedUrl(firstMedia.url);

  if (embedUrl) {
    return (
      <div className="aspect-square w-full overflow-hidden bg-black">
        <iframe
          src={embedUrl}
          title={firstMedia.caption ?? item.title}
          className="h-full w-full object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (firstMedia.kind === "image") {
    return (
      <img
        src={firstMedia.url}
        alt={firstMedia.caption ?? item.title}
        className="aspect-square w-full object-cover"
      />
    );
  }

  return (
    <div className="flex aspect-square w-full items-center justify-center bg-[var(--card-border)]">
      <ImageIcon className="h-12 w-12 text-[var(--muted)]" />
    </div>
  );
}

export function ArtGrid({ items }: { items: ArtItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-[var(--muted)]">
        Henüz sanat çalışması yok.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03, duration: 0.2 }}
        >
          <Link
            href={item.slug ? `/art/${item.slug}` : `/art/${item.id}`}
            className="block overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--card)] transition hover:border-[var(--accent)]/30"
          >
            <MediaThumb item={item} />
            <div className="p-3">
              <h3 className="font-medium text-[var(--foreground)] line-clamp-1">
                {item.title}
              </h3>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                  {item.description}
                </p>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
