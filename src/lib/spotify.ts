import "server-only";
import { getActiveManualTrack } from "@/lib/db/queries";

export interface SpotifyNowPlaying {
  isPlaying: boolean;
  title: string | null;
  artist: string | null;
  albumArt: string | null;
  trackUrl: string | null;
}

/** Şu an dinliyorum kartında gösterilecek track (playlist veya manual). */
export interface NowPlayingTrack {
  id: string;
  title: string;
  artist: string;
  duration_sec: number;
  cover_url: string | null;
  /** Manuel yüklenen MP3; varsa play ile çalar. */
  audio_url?: string | null;
}

/** Client Credentials ile app-only token (playlist tracks için; user scope gerekmez). */
async function getClientCredentialsToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  });
  const data = await res.json();
  return (data.access_token as string) ?? null;
}

/**
 * Public playlist'ten track listesi döner (Client Credentials).
 * Ana sayfada "Şu an dinliyorum" için kullanılır; playlist iframe gösterilmez, sadece şarkı bilgisi.
 */
export async function getPlaylistTracksForNowPlaying(
  playlistId: string
): Promise<NowPlayingTrack[]> {
  const token = await getClientCredentialsToken();
  if (!token || !playlistId.trim()) return [];

  try {
    const all: NowPlayingTrack[] = [];
    let offset = 0;
    const limit = 50;

    while (true) {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId.trim())}/tracks?limit=${limit}&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      if (!res.ok) break;
      const json = (await res.json()) as {
        items?: Array<{
          track?: {
            id?: string;
            name?: string;
            artists?: Array<{ name?: string }>;
            duration_ms?: number;
            album?: { images?: Array<{ url?: string }> };
          } | null;
        }>;
      };
      const items = json.items ?? [];
      for (const it of items) {
        const t = it.track;
        if (!t?.id || !t.name) continue;
        all.push({
          id: t.id,
          title: t.name,
          artist: (t.artists ?? []).map((a) => a.name ?? "").filter(Boolean).join(", ") || "—",
          duration_sec: Math.round((t.duration_ms ?? 0) / 1000) || 180,
          cover_url: t.album?.images?.[0]?.url ?? null,
        });
      }
      if (items.length < limit) break;
      offset += limit;
    }
    return all;
  } catch {
    return [];
  }
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  const data = await res.json();
  return (data.access_token as string) ?? null;
}

async function fetchSpotifyRaw(): Promise<SpotifyNowPlaying> {
  const accessToken = await getAccessToken();

  if (accessToken) {
    try {
      const now = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        }
      );

      if (now.status === 200) {
        const json = await now.json();
        if (json?.item) {
          return {
            isPlaying: true,
            title: json.item.name,
            artist: json.item.artists?.map((a: { name: string }) => a.name).join(", "),
            albumArt: json.item.album?.images?.[0]?.url ?? null,
            trackUrl: json.item.external_urls?.spotify ?? null,
          };
        }
      }

      const recent = await fetch(
        "https://api.spotify.com/v1/me/player/recently-played?limit=1",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        }
      );

      const rj = await recent.json();
      const item = rj?.items?.[0]?.track;

      if (item) {
        return {
          isPlaying: false,
          title: item.name,
          artist: item.artists?.map((a: { name: string }) => a.name).join(", "),
          albumArt: item.album?.images?.[0]?.url ?? null,
          trackUrl: item.external_urls?.spotify ?? null,
        };
      }
    } catch {
      // fallback
    }
  }

  const manual = await getActiveManualTrack();
  if (manual) {
    return {
      isPlaying: false,
      title: manual.title,
      artist: manual.artist,
      albumArt: manual.album_art_url,
      trackUrl: manual.track_url,
    };
  }

  return {
    isPlaying: false,
    title: null,
    artist: null,
    albumArt: null,
    trackUrl: null,
  };
}

export async function getSpotifyNowPlaying(): Promise<SpotifyNowPlaying> {
  return fetchSpotifyRaw();
}
