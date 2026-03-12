import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/site-settings";
import type { MusicTrackRow } from "@/types/database";

/** Admin: tüm parçaları (aktif + pasif) sırayla döndürür. Service role gerekir. */
export async function getMusicTracksAdmin(): Promise<MusicTrackRow[]> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("music_tracks")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []) as MusicTrackRow[];
}

export interface MusicTrackPublic {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  cover_url: string | null;
  duration_sec: number;
  order_index: number;
}

export interface MusicCurrentState {
  serverTime: string;
  startedAt: string | null;
  tracks: MusicTrackPublic[];
  playlistDurationSec: number;
  currentTrackIndex: number;
  currentOffsetSec: number;
  currentTrack: MusicTrackPublic | null;
}

/** Aktif parçaları sırayla döndürür (public okuma). */
export async function getMusicTracks(): Promise<MusicTrackPublic[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("music_tracks")
    .select("id, title, artist, audio_url, cover_url, duration_sec, order_index")
    .eq("is_active", true)
    .order("order_index", { ascending: true });
  const rows = (data ?? []) as MusicTrackRow[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    artist: r.artist,
    audio_url: r.audio_url,
    cover_url: r.cover_url,
    duration_sec: r.duration_sec || 0,
    order_index: r.order_index,
  }));
}

/**
 * Sunucu zamanına göre “şu an hangi parça, kaçıncı saniyede” hesaplar.
 * startedAt yoksa veya track yoksa currentTrackIndex 0, currentOffsetSec 0.
 */
export async function getMusicCurrentState(
  serverTimeMs?: number
): Promise<MusicCurrentState> {
  const now = serverTimeMs ?? Date.now();
  const tracks = await getMusicTracks();
  const settings = await getSiteSettings();
  const startedAt = settings.music_playlist_started_at
    ? new Date(settings.music_playlist_started_at).getTime()
    : null;

  const playlistDurationSec = tracks.reduce((s, t) => s + Math.max(0, t.duration_sec), 0);

  if (tracks.length === 0 || startedAt == null || startedAt > now) {
    return {
      serverTime: new Date(now).toISOString(),
      startedAt: settings.music_playlist_started_at ?? null,
      tracks,
      playlistDurationSec: 0,
      currentTrackIndex: 0,
      currentOffsetSec: 0,
      currentTrack: tracks[0] ?? null,
    };
  }

  const elapsedMs = now - startedAt;
  const elapsedSec = elapsedMs / 1000;
  const loopDuration = playlistDurationSec || 1;
  const positionInLoopSec = elapsedSec % loopDuration;

  let acc = 0;
  let currentIndex = 0;
  let offsetInTrack = 0;
  for (let i = 0; i < tracks.length; i++) {
    const d = tracks[i].duration_sec;
    if (positionInLoopSec < acc + d) {
      currentIndex = i;
      offsetInTrack = Math.floor(positionInLoopSec - acc);
      break;
    }
    acc += d;
  }

  return {
    serverTime: new Date(now).toISOString(),
    startedAt: settings.music_playlist_started_at ?? null,
    tracks,
    playlistDurationSec,
    currentTrackIndex: currentIndex,
    currentOffsetSec: Math.max(0, offsetInTrack),
    currentTrack: tracks[currentIndex] ?? null,
  };
}
