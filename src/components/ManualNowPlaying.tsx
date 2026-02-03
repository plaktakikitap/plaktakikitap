"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export interface NowTrack {
  id: string;
  title: string;
  artist: string;
  duration_sec: number | null;
  cover_url: string | null;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ManualNowPlaying({
  tracks,
}: {
  tracks: NowTrack[];
}) {
  const validTracks = useMemo(
    () => tracks.filter((t) => t.duration_sec != null && t.duration_sec > 0),
    [tracks]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);

  // Sayfa yüklendiğinde rastgele şarkı + rastgele saniye
  useEffect(() => {
    if (validTracks.length === 0) return;
    const idx = Math.floor(Math.random() * validTracks.length);
    const track = validTracks[idx];
    const dur = track.duration_sec ?? 180;
    const startSec = Math.floor(Math.random() * Math.max(1, dur - 1));
    setCurrentIndex(idx);
    setCurrentSec(Math.min(startSec, dur - 1));
  }, [validTracks.length]); // eslint-disable-line react-hooks/exhaustive-deps -- sadece ilk mount'ta

  // Her saniye ilerleme + şarkı bittiğinde sonrakine geç
  useEffect(() => {
    if (validTracks.length === 0) return;
    const track = validTracks[currentIndex];
    const duration = track.duration_sec ?? 180;

    const t = setInterval(() => {
      setCurrentSec((prev) => {
        if (prev + 1 >= duration) {
          setCurrentIndex((i) => (i + 1) % validTracks.length);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [validTracks, currentIndex]);

  if (validTracks.length === 0) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10">
          <div className="h-10 w-10 rounded-full border-2 border-white/20 bg-transparent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white/90">Henüz şarkı yok</p>
          <p className="truncate text-sm text-white/50">
            Admin panelden ekleyin
          </p>
        </div>
      </div>
    );
  }

  const track = validTracks[currentIndex];
  const duration = track.duration_sec ?? 180;
  const progress = (currentSec / duration) * 100;

  return (
    <div className="flex items-center gap-4">
        {/* Sol: dönen plak (dış halka) + sabit merkez kapak */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          {/* Dönen plak halkası (merkez kapağın altında görünen kısım) */}
          <div
            className="absolute inset-0 animate-spin rounded-full"
            style={{ animationDuration: "3s" }}
          >
            <div className="h-full w-full rounded-full border-2 border-white/10 bg-gradient-to-br from-neutral-700 to-neutral-900 shadow-inner" />
          </div>
          {/* Sabit merkez: kapak (plak ortasını örter) */}
          <div className="relative z-10 h-12 w-12 overflow-hidden rounded-full border-2 border-neutral-600 bg-neutral-800 shadow-inner ring-2 ring-neutral-900">
            {track.cover_url ? (
              <Image
                src={track.cover_url}
                alt=""
                fill
                className="object-cover"
                sizes="48px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/30 text-xs">
                ?
              </div>
            )}
          </div>
        </div>

        {/* Sağ: şarkı adı, sanatçı, süre */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white/90">{track.title}</p>
          <p className="truncate text-sm text-white/60">{track.artist}</p>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white/40 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-xs tabular-nums text-white/55">
              {formatTime(currentSec)} / {formatTime(duration)}
            </span>
          </div>
        </div>
    </div>
  );
}
