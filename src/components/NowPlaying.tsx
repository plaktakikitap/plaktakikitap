"use client";

import useSWR from "swr";
import type { LastFmRecentTrack } from "@/app/api/lastfm/route";

const fetcher = async (url: string): Promise<LastFmRecentTrack | null> => {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
};

export function NowPlaying() {
  const { data } = useSWR<LastFmRecentTrack | null>("/api/lastfm", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });

  if (!data?.name || !data?.artist) return null;

  const live = data.date === "şu an çalıyor";
  const line = live
    ? `Şu an dinlediğim şarkı: ${data.artist} - ${data.name}`
    : `Son dinlediğim şarkı: ${data.artist} - ${data.name} (${data.date})`;

  return (
    <p
      className="pointer-events-none mx-auto max-w-[min(92vw,40rem)] truncate text-center"
      style={{
        fontSize: "0.78rem",
        letterSpacing: "0.04em",
        color: "var(--ink-muted)",
        margin: 0,
      }}
      aria-live="polite"
    >
      {line}
    </p>
  );
}
