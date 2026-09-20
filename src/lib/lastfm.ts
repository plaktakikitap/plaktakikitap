import "server-only";

import type { LastFmNowPlaying } from "@/types/now-playing";

export type { LastFmNowPlaying };

type LastFmImage = { size: string; "#text"?: string };
type LastFmTrack = {
  name: string;
  artist?: { "#text"?: string; name?: string };
  image?: LastFmImage[];
  "@attr"?: { nowplaying?: string };
};

export async function getNowPlaying(): Promise<LastFmNowPlaying | null> {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME;

  if (!apiKey?.trim() || !username?.trim()) {
    return null;
  }

  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username.trim())}&api_key=${encodeURIComponent(apiKey.trim())}&format=json&limit=1`;

  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error("Last.fm isteği başarısız");
    const data = await res.json();
    const rawTrack = data?.recenttracks?.track as LastFmTrack | LastFmTrack[] | undefined;
    const track = Array.isArray(rawTrack) ? rawTrack[0] : rawTrack;
    if (!track) return null;

    const isNowPlaying = track["@attr"]?.nowplaying === "true";
    const albumArtRaw =
      track.image?.find((img) => img.size === "large")?.["#text"] ?? null;
    const albumArt =
      albumArtRaw && albumArtRaw.trim().length > 0 ? albumArtRaw : null;

    return {
      title: track.name,
      artist: track.artist?.["#text"] || track.artist?.name || "",
      albumArt,
      isNowPlaying,
    };
  } catch (err) {
    console.error("Last.fm now-playing hatası:", err);
    return null;
  }
}
