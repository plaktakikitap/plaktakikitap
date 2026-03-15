"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import styles from "./AmbientMusicPlayer.module.css";

interface MusicTrackPublic {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  cover_url: string | null;
  duration_sec: number;
  order_index: number;
}

interface MusicCurrentState {
  serverTime: string;
  startedAt: string | null;
  tracks: MusicTrackPublic[];
  playlistDurationSec: number;
  currentTrackIndex: number;
  currentOffsetSec: number;
  currentTrack: MusicTrackPublic | null;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function AmbientMusicPlayer() {
  const [state, setState] = useState<MusicCurrentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progressSec, setProgressSec] = useState(0);
  const [localTrackIndex, setLocalTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/music/current-state");
      const data = await res.json();
      setState(data);
      setLocalTrackIndex(data.currentTrackIndex ?? 0);
      setProgressSec(data.currentOffsetSec ?? 0);
    } catch {
      setState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  useEffect(() => {
    if (!state?.tracks?.length || !audioRef.current) return;
    const track = state.tracks[localTrackIndex];
    if (!track) return;
    const audio = audioRef.current;
    const onEnded = () => {
      const next = (localTrackIndex + 1) % state.tracks.length;
      setLocalTrackIndex(next);
      setProgressSec(0);
      const nextTrack = state.tracks[next];
      if (nextTrack) {
        audio.src = nextTrack.audio_url;
        audio.currentTime = 0;
        if (isPlaying) audio.play();
      }
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [state, localTrackIndex, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setProgressSec((p) => {
        const track = state?.tracks[localTrackIndex];
        const dur = track?.duration_sec ?? 0;
        if (dur && p + 1 >= dur) return 0;
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isPlaying, state, localTrackIndex]);

  const handlePlay = async () => {
    if (!state?.tracks?.length) return;
    const audio = audioRef.current;
    if (!audio) return;
    // Senkron pozisyon için güncel state al (kullanıcı tıkladığında nerede olduğumuz)
    try {
      const res = await fetch("/api/music/current-state");
      const fresh = await res.json();
      setState(fresh);
      setLocalTrackIndex(fresh.currentTrackIndex ?? 0);
      setProgressSec(fresh.currentOffsetSec ?? 0);
      const track = fresh.tracks[fresh.currentTrackIndex];
      if (!track) return;
      audio.src = track.audio_url;
      audio.currentTime = fresh.currentOffsetSec ?? 0;
      audio.muted = muted;
      audio.play();
      setIsPlaying(true);
    } catch {
      const track = state.tracks[localTrackIndex];
      if (!track) return;
      audio.src = track.audio_url;
      audio.currentTime = progressSec;
      audio.muted = muted;
      audio.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
  };

  if (loading || !state) return null;
  if (!state.tracks.length || !state.currentTrack) return null;

  const track = state.tracks[localTrackIndex] ?? state.currentTrack;
  const duration = track.duration_sec || 180;
  const progress = (progressSec / duration) * 100;

  // Ses site açılışında asla otomatik başlamaz; sadece Play’e basılınca kaldığı yerden çalar.
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-3xl">
      <audio ref={audioRef} preload="metadata" />
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <p className="text-sm tracking-wide text-white/70">Şu an dinliyorum</p>
      </div>
      <div className="px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
        <div className="flex items-center gap-4">
          {/* Gerçekçi plak: dönen vinil + kenarda iğne (tonearm) */}
          <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center">
            {/* Dönen plak — vinil çizgiler + orta etiket */}
            <div
              className={`${styles.vinylDisc} absolute inset-0 rounded-full`}
              style={{
                background: `
                  radial-gradient(circle at 50% 50%, #0f0e0d 0%, #0f0e0d 26%, transparent 27%),
                  repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 1.2px, rgba(0,0,0,0.35) 1.2px, rgba(0,0,0,0.35) 2.4px),
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.04) 0%, transparent 35%),
                  radial-gradient(circle at 70% 70%, rgba(0,0,0,0.3) 0%, transparent 40%),
                  linear-gradient(165deg, #1c1b19 0%, #0d0c0b 50%, #151412 100%)
                `,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 6px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.14), 0 0 18px rgba(212,175,55,0.14), 0 0 36px rgba(212,175,55,0.08)",
              }}
            >
              {/* Orta etiket (kapak) — plakla birlikte döner (küçük çap) */}
              <div
                className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full relative"
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
              viewBox="0 0 72 72"
              fill="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4a4a4a" />
                  <stop offset="50%" stopColor="#2e2e2e" />
                  <stop offset="100%" stopColor="#1a1a1a" />
                </linearGradient>
                <filter id="armShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodOpacity="0.35" />
                </filter>
              </defs>
              {/* Kol: pivot (sağ üst) → plağın sol alt kenarına (iğne plağa değiyor) */}
              <path
                d="M 56 12 Q 32 28 18 42"
                stroke="url(#armGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                filter="url(#armShadow)"
              />
              {/* Pivot noktası */}
              <circle cx="56" cy="12" r="2.2" fill="#1f1f1f" stroke="#404040" strokeWidth="0.7" />
              {/* İğne ucu — plağa değen elmas uç */}
              <path
                d="M 16 44 L 18 42 L 20 44 L 18 46 Z"
                fill="#0d0d0d"
                stroke="#333"
                strokeWidth="0.5"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-white/90">{track.title}</p>
            <p className="truncate text-sm text-white/60">{track.artist}</p>
            {isPlaying && (
              <p className="mt-2 text-xs text-white/50">
                Şu an çalan: {track.title} — {track.artist}
              </p>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm italic text-white/70">
          {isPlaying
            ? "Benimle birlikte dinlemeye devam edebilirsin"
            : "Play’e basınca playlist kaldığı yerden sesli çalar (tüm gün aynı zaman çizgisi)."}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={isPlaying ? handlePause : handlePlay}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/90 text-white hover:bg-amber-500 shadow-md hover:shadow-lg transition"
            aria-label={isPlaying ? "Duraklat" : "Oynat"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
            aria-label={muted ? "Sesi aç" : "Sessiz"}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <div className="flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-1.5 rounded-full bg-white/40 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-white/55">
            {formatTime(progressSec)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
