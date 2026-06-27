"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatRelativeTimeTr } from "@/lib/format-relative-time";
import type { LastFmNowPlaying as LastFmTrack } from "@/types/now-playing";

function usePlayedAgoLabel(track: LastFmTrack) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (track.isNowPlaying) {
      setLabel("şimdi");
      return;
    }
    if (!track.playedAt) {
      setLabel(null);
      return;
    }

    const update = () => setLabel(formatRelativeTimeTr(track.playedAt!));
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, [track.isNowPlaying, track.playedAt]);

  return label;
}

export default function LastFmNowPlaying({ initial }: { initial: LastFmTrack }) {
  const [track, setTrack] = useState(initial);
  const playedAgo = usePlayedAgoLabel(track);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/now-playing");
        if (!res.ok) return;
        const data = (await res.json()) as LastFmTrack | null;
        if (data?.title) setTrack(data);
      } catch {
        /* geçici ağ hatası — mevcut veriyi koru */
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const cardTitle = track.isNowPlaying ? "Şu an dinliyorum:" : "Son dinlediğim:";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-3xl">
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <p className="text-sm tracking-wide text-white/70">{cardTitle}</p>
      </div>
      <div className="px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                animation: track.isNowPlaying
                  ? "manual-vinyl-spin 2.8s linear infinite"
                  : undefined,
                background: `
                  radial-gradient(circle at 50% 50%, #0f0e0d 0%, #0f0e0d 24%, transparent 25%),
                  repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px),
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05) 0%, transparent 45%),
                  radial-gradient(circle at 70% 70%, rgba(0,0,0,0.35) 0%, transparent 45%),
                  linear-gradient(145deg, #1c1b19 0%, #0d0c0b 50%, #151412 100%)
                `,
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 6px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.14), 0 0 18px rgba(212,175,55,0.14), 0 0 36px rgba(212,175,55,0.08)",
              }}
            >
              <div
                className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full"
                style={{
                  boxShadow:
                    "inset 0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3), 0 0 0 1px rgba(212,175,55,0.22)",
                  background: track.albumArt
                    ? undefined
                    : "linear-gradient(145deg, #35322e 0%, #252320 50%, #1c1b18 100%)",
                }}
              >
                {track.albumArt ? (
                  <Image
                    src={track.albumArt}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                ) : (
                  <span className="text-[0.5rem] font-medium text-amber-200/50">♪</span>
                )}
              </div>
              <div
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-950 ring-1 ring-neutral-700"
                style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.9)" }}
              />
            </div>
            <svg
              className="absolute inset-0 h-full w-full pointer-events-none"
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden
            >
              <path
                d="M 50 10 Q 28 24 16 38"
                stroke="#2e2e2e"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="50" cy="10" r="2" fill="#1f1f1f" stroke="#404040" strokeWidth="0.6" />
              <path
                d="M 14 40 L 16 38 L 18 40 L 16 42 Z"
                fill="#0d0d0d"
                stroke="#333"
                strokeWidth="0.5"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-white/90">{track.title}</p>
            <p className="truncate text-sm text-white/60">{track.artist}</p>
            <p className="mt-2 text-xs text-white/40">
              {playedAgo ? (
                <>
                  <span className="text-white/50">{playedAgo}</span>
                  {" · "}
                </>
              ) : null}
              Apple Music
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
