"use client";

import { motion } from "framer-motion";
import type { Video } from "@/types/videos";
import { VideosGrid } from "./VideosGrid";

interface VideosContentProps {
  videos: Video[];
}

export function VideosContent({ videos }: VideosContentProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="font-editorial text-3xl font-semibold text-white sm:text-4xl">
          Videolar
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Plaktaki Kitap
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <VideosGrid videos={videos} />
      </motion.div>
    </div>
  );
}
