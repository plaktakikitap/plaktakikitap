import { NextResponse } from "next/server";

export type LastFmRecentTrack = {
  artist: string;
  name: string;
  /** Göreli zaman metni; canlıysa "şu an çalıyor" */
  date: string;
};

type LastFmTrack = {
  name?: string;
  artist?: { "#text"?: string; name?: string };
  "@attr"?: { nowplaying?: string };
  date?: { uts?: string; "#text"?: string };
};

function formatRelativeTr(utsSec: number): string {
  const diffSec = Math.max(0, Math.floor(Date.now() / 1000 - utsSec));
  if (diffSec < 60) return "az önce";
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins} dakika önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ay önce`;
  return `${Math.floor(days / 365)} yıl önce`;
}

export async function GET() {
  const apiKey = process.env.LASTFM_API_KEY?.trim();
  const username = process.env.LASTFM_USERNAME?.trim();

  if (!apiKey || !username) {
    return NextResponse.json(
      { error: "LASTFM_API_KEY veya LASTFM_USERNAME eksik" },
      { status: 503 }
    );
  }

  const url =
    `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
    `&user=${encodeURIComponent(username)}` +
    `&api_key=${encodeURIComponent(apiKey)}` +
    `&format=json&limit=1`;

  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Last.fm isteği başarısız" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data?.recenttracks?.track as
      | LastFmTrack
      | LastFmTrack[]
      | undefined;
    const track = Array.isArray(raw) ? raw[0] : raw;
    if (!track?.name) {
      return NextResponse.json({ error: "track yok" }, { status: 404 });
    }

    const nowPlaying = track["@attr"]?.nowplaying === "true";
    const artist =
      track.artist?.["#text"] || track.artist?.name || "Bilinmeyen";
    const uts = track.date?.uts
      ? Number.parseInt(track.date.uts, 10)
      : NaN;

    const payload: LastFmRecentTrack = {
      artist,
      name: track.name,
      date:
        nowPlaying || Number.isNaN(uts)
          ? "şu an çalıyor"
          : formatRelativeTr(uts),
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Last.fm bağlantı hatası" },
      { status: 502 }
    );
  }
}
