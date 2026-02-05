"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Youtube } from "lucide-react";
import type { PlaktakiKitapSettingsRow } from "@/lib/plaktaki-kitap";

function formatSubscribers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString("tr-TR");
}

interface PlaktakiKitapIntroProps {
  settings: PlaktakiKitapSettingsRow | null;
}

export function PlaktakiKitapIntro({ settings }: PlaktakiKitapIntroProps) {
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/youtube/subscribers")
      .then((r) => r.json())
      .then((d: { subscriberCount?: number | null }) => {
        if (typeof d.subscriberCount === "number") setSubscriberCount(d.subscriberCount);
      })
      .catch(() => {});
  }, []);

  if (!settings) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-10"
    >
      <div className="rounded-xl border border-amber-400/15 bg-white/5 px-5 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
        {settings.intro_text ? (
          <p className="font-serif text-base leading-relaxed text-white/95 sm:text-lg">
            {settings.intro_text}
          </p>
        ) : (
          <p className="font-serif text-base italic text-white/50 sm:text-lg">
            Kanal tanıtım metni burada görünecek. Admin panelinden düzenleyebilirsiniz.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {settings.youtube_channel_url && (
          <a
            href={settings.youtube_channel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-200 transition hover:border-amber-400/50 hover:bg-amber-500/20 hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            <Youtube className="h-4 w-4" aria-hidden />
            YouTube Kanalıma Git
          </a>
        )}
        {subscriberCount != null ? (
          <div
            className="inline-flex rounded-full border border-amber-400/25 bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-200"
            aria-label={`${subscriberCount.toLocaleString("tr-TR")} abone`}
          >
            Ailemiz <span className="mx-1.5 font-semibold text-amber-100">{formatSubscribers(subscriberCount)}</span> kişiye ulaştı!
          </div>
        ) : (
          <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70">
            Ailemiz büyüyor!
          </span>
        )}
        {settings.spotify_profile_url && (
          <a
            href={settings.spotify_profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-green-400/25 bg-green-500/15 px-4 py-2 text-sm font-medium text-green-200 transition hover:border-green-400/40 hover:bg-green-500/25 hover:text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400/50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.091-.669-.261-.42-.571 1.74-2.04 4.64-3.061 7.921-3.061 1.881 0 3.481.33 4.921.999.36.149.48.66.24 1.021zm1.44-3.3c-.301.42-.841.561-1.262.241-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-.718-.239-.419-.659 2.159-2.58 5.76-3.3 9.239-2.04 1.121.27 2.161.66 3.119 1.32.421.27.601.9.301 1.32zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-.719-.36-.24-.66 3.921-2.34 10.921-2.58 15.24-1.5.599.15.779.66.3.959z" />
            </svg>
            Sesli kitaplara Spotify&apos;dan da ulaşabilirsiniz!
          </a>
        )}
      </div>
    </motion.section>
  );
}
