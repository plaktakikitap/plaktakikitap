"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export interface NowTrack {
  id: string;
  title: string;
  artist: string;
  duration_sec: number | null;
  cover_url: string | null;
  audio_url?: string | null;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const hasAnyAudio = (tracks: NowTrack[]) => tracks.some((t) => t.audio_url);

export default function ManualNowPlaying({
  tracks,
}: {
  tracks: NowTrack[];
}) {
  const validTracks = useMemo(
    () => tracks.map((t) => ({ ...t, duration_sec: t.duration_sec && t.duration_sec > 0 ? t.duration_sec : 180 })),
    [tracks]
  );
  const useRealAudio = hasAnyAudio(validTracks);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Gerçek ses: parça değişince src güncelle, bittiğinde sonraki parça
  useEffect(() => {
    if (!useRealAudio || !audioRef.current || validTracks.length === 0) return;
    const track = validTracks[currentIndex];
    if (track.audio_url) {
      audioRef.current.src = track.audio_url;
      audioRef.current.currentTime = 0;
      setCurrentSec(0);
      if (isPlaying) audioRef.current.play();
    }
  }, [currentIndex, useRealAudio, validTracks, isPlaying]);

  useEffect(() => {
    if (!useRealAudio || !audioRef.current) return;
    const audio = audioRef.current;
    const onTimeUpdate = () => setCurrentSec(Math.floor(audio.currentTime));
    const onEnded = () => {
      setCurrentIndex((i) => (i + 1) % validTracks.length);
      setCurrentSec(0);
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [useRealAudio, validTracks.length]);

  // Fake timer: ses yoksa sadece saniye sayacı
  useEffect(() => {
    if (validTracks.length === 0 || useRealAudio) return;
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
  }, [validTracks, currentIndex, useRealAudio]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current || !useRealAudio) return;
    const track = validTracks[currentIndex];
    if (!track?.audio_url) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.src = track.audio_url;
      audioRef.current.currentTime = currentSec;
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [useRealAudio, validTracks, currentIndex, currentSec, isPlaying]);

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
  const canPlay = useRealAudio && !!track.audio_url;

  return (
    <div className="flex items-center gap-4">
        <audio ref={audioRef} preload="metadata" />
        {/* Sol: play butonu (ses varsa) + dönen plak */}
        {canPlay && (
          <button
            type="button"
            onClick={handlePlayPause}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            aria-label={isPlaying ? "Duraklat" : "Oynat"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
        )}
        {/* Plak: dış disk döner, ortada etiket (kapak veya düz) + merkez delik */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          {/* Dönen vinil disk — koyu, hafif parlak, groove hissi */}
          <div
            className="absolute inset-0 animate-spin rounded-full"
            style={{
              animationDuration: "2.8s",
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06) 0%, transparent 50%),
                repeating-radial-gradient(circle at center, transparent 0, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px),
                radial-gradient(circle at 70% 70%, rgba(0,0,0,0.4) 0%, transparent 45%),
                linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 40%, #151515 100%)
              `,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -2px 8px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)",
            }}
          />
          {/* Sabit orta etiket (kapak veya renk) */}
          <div
            className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.3)",
              background: track.cover_url ? undefined : "linear-gradient(145deg, #2d2520 0%, #1a1512 100%)",
            }}
          >
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
              <span className="text-[0.6rem] font-medium text-amber-200/40">♪</span>
            )}
            {/* Merkez delik */}
            <div
              className="absolute left-1/2 top-1/2 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-950 ring-2 ring-neutral-800"
              style={{ boxShadow: "inset 0 1px 1px rgba(0,0,0,0.8)" }}
            />
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
