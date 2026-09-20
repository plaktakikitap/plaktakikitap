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

  return (
    <p
      className="pointer-events-none mx-auto max-w-[min(90vw,26rem)] truncate text-center"
      style={{
        fontSize: "0.72rem",
        letterSpacing: "0.12em",
        color: "var(--ink-muted)",
        margin: 0,
      }}
      aria-live="polite"
    >
      <span aria-hidden>♪ </span>
      {data.artist} — {data.name}
      <span style={{ margin: "0 0.35em", opacity: 0.55 }}>·</span>
      {live ? (
        <span className="inline-flex items-center gap-1.5 align-middle">
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[rgba(192,160,96,0.9)]"
            aria-hidden
          />
          <span>şu an çalıyor</span>
        </span>
      ) : (
        <span>{data.date}</span>
      )}
    </p>
  );
}
