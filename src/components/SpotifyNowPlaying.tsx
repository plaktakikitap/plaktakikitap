"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SpotifyNowPlaying() {
  const { data } = useSWR("/api/spotify/now-playing", fetcher, {
    refreshInterval: 15000, // 15 sn
  });

  const isPlaying = !!data?.isPlaying;
  const title = data?.title ?? "—";
  const artist = data?.artist ?? "";
  const albumArt = data?.albumArt ?? null;
  const label = isPlaying ? "Şu an dinliyorum:" : "En son dinlediğim:";

  const profileUrl = "https://open.spotify.com/user/9vqh11rh2lmtmanlt68iv490t?si=c448421038964091";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noreferrer"
      className="group block w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:bg-white/8"
    >
      <div className="text-xs tracking-wide text-white/70">{label}</div>

      <div className="mt-3 flex gap-3">
        <div className="h-14 w-14 overflow-hidden rounded-xl bg-white/10">
          {albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={albumArt} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="truncate text-base font-semibold">{title}</div>
          <div className="truncate text-sm text-white/70">{artist}</div>

          <div className="mt-2 flex items-center gap-2 text-[11px] text-white/55">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isPlaying ? "bg-emerald-400" : "bg-white/30"
              }`}
            />
            {isPlaying ? "çalıyor" : "duraklatıldı"}
          </div>
        </div>
      </div>
    </a>
  );
}
