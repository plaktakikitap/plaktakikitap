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

/** Resmi Spotify ikonu (Simple Icons / marka uyumlu) */
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
      className="mb-2"
    >
      {/* Açıklama kutucuğu */}
      <div className="rounded-xl border border-amber-400/15 bg-white/5 px-5 py-3 backdrop-blur-sm sm:px-6 sm:py-3.5">
        {settings.intro_text ? (
          <p className="font-serif text-sm italic leading-relaxed text-white/75 sm:text-base">
            {settings.intro_text}
          </p>
        ) : (
          <p className="font-serif text-sm italic leading-relaxed text-white/75 sm:text-base">
            Kanal tanıtım metni burada görünecek. Admin panelinden düzenleyebilirsiniz.
          </p>
        )}
      </div>

      {/* Açıklamanın hemen altı: butonlar ve abone kutusu yan yana */}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {settings.youtube_channel_url && (
            <a
              href={settings.youtube_channel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-200 transition hover:border-amber-400/50 hover:bg-amber-500/20 hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <Youtube className="h-4 w-4" aria-hidden />
              YouTube Kanalıma Buradan Ulaşabilirsiniz
            </a>
          )}
          {settings.spotify_profile_url && (
            <a
              href={settings.spotify_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#1DB954]/40 bg-[#1DB954]/20 px-3.5 py-1.5 text-sm font-medium text-white/95 transition hover:border-[#1DB954]/60 hover:bg-[#1DB954]/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#1DB954]/50"
            >
              <SpotifyIcon className="h-5 w-5 shrink-0" />
              Seslendirdiğim kitapları Spotify&apos;dan da dinleyebilirsiniz!
            </a>
          )}
        </div>

        {/* Yuvarlak abone kutusu — butonların yanında, kompakt */}
        <div
          className="relative flex h-32 w-32 shrink-0 items-center justify-center sm:h-36 sm:w-36"
          aria-label={subscriberCount != null ? `${subscriberCount.toLocaleString("tr-TR")} abone` : "Ailemiz büyüyor"}
        >
            {/* Çember etrafında eğimli yazı (üst yarım) */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              fill="none"
              aria-hidden
            >
              <defs>
                <path
                  id="plaktaki-arc"
                  d="M 20 50 A 30 30 0 0 1 50 20 A 30 30 0 0 1 80 50"
                />
              </defs>
              <text
                className="fill-amber-200/95 text-[0.4rem] font-semibold tracking-wider sm:text-[0.45rem]"
                style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
              >
                <textPath href="#plaktaki-arc" startOffset="0">
                  Ailemiz büyüyor!
                </textPath>
              </text>
            </svg>

            {/* Ortada parlak yuvarlak kutu */}
            <div
              className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full sm:h-28 sm:w-28"
              style={{
                background: "linear-gradient(145deg, rgba(251,191,36,0.35) 0%, rgba(245,158,11,0.25) 40%, rgba(251,191,36,0.2) 100%)",
                boxShadow:
                  "0 0 0 1px rgba(251,191,36,0.4), 0 0 30px rgba(251,191,36,0.25), 0 0 60px rgba(251,191,36,0.15), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.1)",
              }}
            >
              <div
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                  background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent 60%)",
                }}
                aria-hidden
              />
              {subscriberCount != null ? (
                <span className="relative text-center text-base font-bold tabular-nums text-amber-50 drop-shadow-sm">{formatSubscribers(subscriberCount)}</span>
              ) : (
                <span className="relative text-lg font-semibold text-amber-100/90">—</span>
              )}
              <span className="relative text-[0.65rem] font-medium uppercase tracking-wider text-amber-200/80 sm:text-[0.75rem]">abone</span>
            </div>
        </div>
      </div>
    </motion.section>
  );
}
