"use client";

import { motion } from "framer-motion";
import { Youtube } from "lucide-react";

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <img
      src="https://cdn.simpleicons.org/spotify/FFFFFF"
      alt=""
      width={20}
      height={20}
      className={className}
      aria-hidden
    />
  );
}

function formatSubscribers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString("tr-TR");
}

interface ChannelIntroSectionProps {
  text: string | null;
  channelUrl: string | null;
  subscriberCount: number | null;
  spotifyUrl: string | null;
}

export function ChannelIntroSection({
  text,
  channelUrl,
  subscriberCount,
  spotifyUrl,
}: ChannelIntroSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-10"
    >
      <div className="rounded-xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
        {text ? (
          <p className="font-serif text-base leading-relaxed text-white/95 sm:text-lg">
            {text}
          </p>
        ) : (
          <p className="font-serif text-base italic text-white/50 sm:text-lg">
            Kanal tanıtım metni burada görünecek. Admin panelinden düzenleyebilirsiniz.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {subscriberCount != null && (
          <div
            className="inline-flex items-center rounded-full border border-amber-400/25 bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-200 shadow-sm"
            aria-label={`${subscriberCount.toLocaleString("tr-TR")} abone`}
          >
            Ailemiz <span className="mx-1.5 font-semibold text-amber-100">{formatSubscribers(subscriberCount)}</span> kişiye ulaştı!
          </div>
        )}
        {spotifyUrl && (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#1DB954]/40 bg-[#1DB954]/20 px-4 py-2 text-sm font-medium text-white/95 transition hover:border-[#1DB954]/60 hover:bg-[#1DB954]/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]/50"
          >
            <SpotifyIcon className="h-5 w-5 shrink-0" />
            Sesli kitaplara Spotify&apos;dan da ulaşabilirsiniz!
          </a>
        )}
      </div>

      {channelUrl && (
        <div className="mt-6">
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-5 py-3 font-medium text-amber-200 transition-all duration-200 hover:border-amber-400/60 hover:bg-amber-500/25 hover:shadow-[0_0_20px_rgba(251,191,36,0.25)] hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          >
            <Youtube className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden />
            YouTube Kanalıma Git
          </a>
        </div>
      )}
    </motion.section>
  );
}
