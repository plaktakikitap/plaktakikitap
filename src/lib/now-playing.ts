import "server-only";

import { supabaseServer } from "@/lib/supabase-server";
import {
  getPlaylistTracksForNowPlaying,
  getSpotifyNowPlaying,
  type NowPlayingTrack,
} from "@/lib/spotify";
import { getMusicCurrentState } from "@/lib/music";
import { getCurrentReading } from "@/lib/db/queries";
import { getNowPlaying } from "@/lib/lastfm";
import type { NowPlayingBook, NowPlayingData, LastFmNowPlaying } from "@/types/now-playing";

export type { NowPlayingBook, NowPlayingData, LastFmNowPlaying };

/** Admin panelde eklenen şarkılar manual_now_playing tablosunda; sırayla gösterilmek üzere buradan alınır. */
export async function getManualNowTracks(): Promise<NowPlayingTrack[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("manual_now_playing")
    .select("id, title, artist, album_art_url, audio_url, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as {
    id: string;
    title: string;
    artist: string;
    album_art_url: string | null;
    audio_url: string | null;
  }[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    artist: r.artist,
    duration_sec: 180,
    cover_url: r.album_art_url,
    audio_url: r.audio_url ?? null,
  }));
}

/** Ana sayfa şeridi — kitap tarafı (müzik Last.fm API route üzerinden client'ta). */
export async function getNowPlayingData(): Promise<NowPlayingData> {
  let readingBook: Awaited<ReturnType<typeof getCurrentReading>> = null;

  try {
    readingBook = await getCurrentReading();
  } catch {
    readingBook = null;
  }

  const book = readingBook
    ? {
        title: readingBook.title,
        author: readingBook.author,
        coverUrl: readingBook.cover_url,
      }
    : null;

  return { book };
}

/**
 * NowPanel müzik verisi: önce Last.fm, yoksa admin manuel şarkılar, sonra Spotify.
 */
export async function getStripMusicNowPlaying(): Promise<LastFmNowPlaying | null> {
  try {
    const lastfm = await getNowPlaying();
    if (lastfm) return lastfm;
  } catch {
    /* Last.fm yapılandırılmamış veya geçici hata */
  }

  try {
    const manual = await getManualNowTracks();
    if (manual.length > 0) {
      const track = manual[0];
      return {
        title: track.title,
        artist: track.artist,
        albumArt: track.cover_url,
        isNowPlaying: false,
        playedAt: null,
      };
    }
  } catch {
    /* Supabase yok veya tablo boş */
  }

  try {
    const spotify = await getSpotifyNowPlaying();
    if (spotify.title) {
      return {
        title: spotify.title,
        artist: spotify.artist ?? "",
        albumArt: spotify.albumArt,
        isNowPlaying: spotify.isPlaying,
        playedAt: null,
      };
    }
  } catch {
    /* Spotify yapılandırılmamış */
  }

  return null;
}

/** NowPanel müzik bölümü için genişletilmiş veri. */
export async function getNowPanelMusicData() {
  let lastFmTrack: LastFmNowPlaying | null = null;
  try {
    lastFmTrack = await getStripMusicNowPlaying();
  } catch {
    lastFmTrack = null;
  }

  let musicState: Awaited<ReturnType<typeof getMusicCurrentState>>;
  try {
    musicState = await getMusicCurrentState();
  } catch {
    musicState = {
      serverTime: new Date().toISOString(),
      startedAt: null,
      tracks: [],
      playlistDurationSec: 0,
      currentTrackIndex: 0,
      currentOffsetSec: 0,
      currentTrack: null,
    };
  }

  const useAmbient =
    musicState.tracks.length > 0 &&
    musicState.startedAt != null &&
    musicState.startedAt !== "";

  const playlistId = (process.env.SPOTIFY_PLAYLIST_ID ?? "").trim();
  let tracks: NowPlayingTrack[] = [];
  try {
    const playlistTracks =
      playlistId.length > 0 ? await getPlaylistTracksForNowPlaying(playlistId) : [];
    tracks =
      playlistTracks.length > 0 ? playlistTracks : await getManualNowTracks();
  } catch {
    tracks = [];
  }

  const playlistUrl = playlistId
    ? `https://open.spotify.com/playlist/${playlistId}`
    : null;

  return { musicState, tracks, useAmbient, playlistUrl, lastFmTrack };
}
