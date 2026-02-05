"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import type { WorksItem } from "@/types/works";
import { parseYouTubeVideoId, getYouTubeThumbUrl } from "@/lib/works-utils";

interface YouTubeGalleryProps {
  items: WorksItem[];
}

export function YouTubeGallery({ items }: YouTubeGalleryProps) {
  if (items.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="mb-6 font-editorial text-2xl font-medium text-white sm:text-3xl">
        Video
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <YouTubeCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function YouTubeCard({ item }: { item: WorksItem }) {
  const [embed, setEmbed] = useState(false);
  const videoId = parseYouTubeVideoId(item.url);
  const thumb = item.image_url || (videoId ? getYouTubeThumbUrl(videoId) : null);

  if (!videoId) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl"
    >
      {!embed ? (
        <>
          {thumb && (
            <img
              src={thumb}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#050A14]/80 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-0"
            onClick={() => setEmbed(true)}
            onKeyDown={(e) => e.key === "Enter" && setEmbed(true)}
            role="button"
            tabIndex={0}
            aria-label={`İzle: ${item.title}`}
          >
            <span className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
              {item.title || "Video"}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/70">izle</span>
            <div className="rounded-full bg-white/20 p-3">
              <Play className="h-6 w-6 fill-white text-white" />
            </div>
          </div>
        </>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={item.title || "YouTube"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}
    </motion.article>
  );
}
