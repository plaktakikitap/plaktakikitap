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
        {/* Plak: dönen vinil + orta etiket (plağla birlikte döner) + tonearm/igne */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          {/* Dönen vinil disk — groove + etiket + delik hep birlikte döner */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              animation: "manual-vinyl-spin 2.8s linear infinite",
              background: `
                radial-gradient(circle at 50% 50%, #0f0e0d 0%, #0f0e0d 24%, transparent 25%),
                repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px),
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05) 0%, transparent 45%),
                radial-gradient(circle at 70% 70%, rgba(0,0,0,0.35) 0%, transparent 45%),
                linear-gradient(145deg, #1c1b19 0%, #0d0c0b 50%, #151412 100%)
              `,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 6px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.14), 0 0 18px rgba(212,175,55,0.14), 0 0 36px rgba(212,175,55,0.08)",
            }}
          >
            {/* Orta etiket — plağla birlikte döner (küçük çap) */}
            <div
              className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full"
              style={{
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3), 0 0 0 1px rgba(212,175,55,0.22)",
                background: track.cover_url ? undefined : "linear-gradient(145deg, #35322e 0%, #252320 50%, #1c1b18 100%)",
              }}
            >
              {track.cover_url ? (
                <Image
                  src={track.cover_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="32px"
                  unoptimized
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
          {/* Tonearm + iğne — sabit, plağın kenarına değiyor */}
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="manualArmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4a4a4a" />
                <stop offset="50%" stopColor="#2e2e2e" />
                <stop offset="100%" stopColor="#1a1a1a" />
              </linearGradient>
              <filter id="manualArmShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodOpacity="0.35" />
              </filter>
            </defs>
            <path
              d="M 50 10 Q 28 24 16 38"
              stroke="url(#manualArmGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#manualArmShadow)"
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
