"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Disc3 } from "lucide-react";
import { parseYouTubeVideoId, getYouTubeThumbUrl } from "@/lib/works-utils";
import type { Video } from "@/types/videos";
import { VideoModal } from "./VideoModal";

function getThumb(v: Video): string {
  if (v.thumbnail_url?.startsWith("http")) return v.thumbnail_url;
  const id = parseYouTubeVideoId(v.youtube_url);
  return id ? getYouTubeThumbUrl(id) : "";
}

function isAudioBook(v: Video): boolean {
  return (v as { type?: string }).type === "audio_book";
}

interface VideosGridProps {
  videos: Video[];
}

export function VideosGrid({ videos }: VideosGridProps) {
  const [modalVideo, setModalVideo] = useState<Video | null>(null);

  if (videos.length === 0) {
    return (
      <p className="py-16 text-center text-white/60">
        Henüz video eklenmemiş.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video, i) => {
          const isPlak = isAudioBook(video);
          return (
            <motion.article
              key={video.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.2) }}
              className="group relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl backdrop-blur-sm"
            >
              {isPlak ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-900/40 to-black/80">
                  <Disc3 className="h-24 w-24 text-amber-200/80" strokeWidth={1.2} aria-hidden />
                </div>
              ) : (
                <img
                  src={getThumb(video)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div
                className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#050A14]/75 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-0"
                onClick={() => setModalVideo(video)}
                onKeyDown={(e) => e.key === "Enter" && setModalVideo(video)}
                role="button"
                tabIndex={0}
                aria-label={isPlak ? `Dinle: ${video.title}` : `İzle: ${video.title}`}
              >
                <span className="line-clamp-2 max-w-full px-3 text-center text-sm font-medium text-white/95">
                  {video.title || (isPlak ? "Sesli kitap" : "Video")}
                </span>
                <span className="flex items-center gap-1 text-xs text-white/70">
                  {isPlak ? "Plaktaki Kitap · dinle" : "Plaktaki Kitap · izle"}
                </span>
                <div className="rounded-full bg-white/20 p-3">
                  {isPlak ? (
                    <Disc3 className="h-6 w-6 fill-white text-white" strokeWidth={1.5} aria-hidden />
                  ) : (
                    <Play className="h-6 w-6 fill-white text-white" />
                  )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <VideoModal video={modalVideo} onClose={() => setModalVideo(null)} />
    </>
  );
}
