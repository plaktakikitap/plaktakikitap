"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

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

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-3xl">
      <audio ref={audioRef} preload="metadata" />
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <p className="text-sm tracking-wide text-white/70">Şu an dinliyorum</p>
      </div>
      <div className="px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
        <div className="flex items-center gap-4">
          {/* Plak: dönen vinil + orta etiket (kapak) + merkez delik */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
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
              <div
                className="absolute left-1/2 top-1/2 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-950 ring-2 ring-neutral-800"
                style={{ boxShadow: "inset 0 1px 1px rgba(0,0,0,0.8)" }}
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-white/90">{track.title}</p>
            <p className="truncate text-sm text-white/60">{track.artist}</p>
            <p className="mt-2 text-xs text-white/50">
              Şu an çalan: {track.title} — {track.artist}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm italic text-white/70">
          Benimle birlikte dinlemeye devam edebilirsin
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={isPlaying ? handlePause : handlePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
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
