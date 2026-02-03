"use client";

import { useEffect, useState } from "react";
import { Music } from "lucide-react";

interface NowPlayingData {
  isPlaying: boolean;
  title: string | null;
  artist: string | null;
  albumArt: string | null;
  trackUrl: string | null;
}

export function NowPlayingWidget() {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/spotify/now-playing")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setData(null);
          return;
        }
        if (d.title || d.albumArt) {
          setData({
            isPlaying: d.isPlaying ?? false,
            title: d.title ?? null,
            artist: d.artist ?? null,
            albumArt: d.albumArt ?? null,
            trackUrl: d.trackUrl ?? null,
          });
        } else {
          setData(null);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data?.title) return null;

  const content = (
    <div className="flex items-center gap-4 rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-[12px]">
      {data.albumArt ? (
        <img
          src={data.albumArt}
          alt=""
          className="h-14 w-14 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/10">
          <Music className="h-7 w-7 text-white/70" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wider text-white/60">
          {data.isPlaying ? "Şu an dinliyorum" : "En son dinlediğim"}
        </div>
        <div className="truncate font-medium text-white">{data.title}</div>
        {data.artist && (
          <div className="truncate text-sm text-white/75">{data.artist}</div>
        )}
      </div>
    </div>
  );

  if (data.trackUrl) {
    return (
      <a
        href={data.trackUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block transition hover:opacity-90"
      >
        {content}
      </a>
    );
  }

  return content;
}
