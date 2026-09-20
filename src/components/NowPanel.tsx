import Image from "next/image";
import { getCurrentReading } from "@/lib/db/queries";
import { getNowPanelMusicData } from "@/lib/now-playing";
import ManualNowPlaying from "./ManualNowPlaying";
import { AmbientMusicPlayer } from "./AmbientMusicPlayer";


function GlassCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-3xl">
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <p className="text-sm tracking-wide text-white/70">{title}</p>
      </div>
      <div className="px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">{children}</div>
    </div>
  );
}

export default async function NowPanel() {
  let musicData: Awaited<ReturnType<typeof getNowPanelMusicData>>;
  let readingBook: Awaited<ReturnType<typeof getCurrentReading>> = null;
  try {
    [musicData, readingBook] = await Promise.all([
      getNowPanelMusicData(),
      getCurrentReading(),
    ]);
  } catch {
    musicData = {
      musicState: {
        serverTime: new Date().toISOString(),
        startedAt: null,
        tracks: [],
        playlistDurationSec: 0,
        currentTrackIndex: 0,
        currentOffsetSec: 0,
        currentTrack: null,
      },
      tracks: [],
      useAmbient: false,
      playlistUrl: null,
    };
    readingBook = null;
  }

  const { tracks, useAmbient } = musicData;
  const reading = readingBook
    ? {
        book_title: readingBook.title,
        author: readingBook.author,
        cover_url: readingBook.cover_url,
        note: null,
        updated_at: readingBook.last_progress_update_at,
      }
    : null;
  const readingTitle = reading ? "Şu an okuyorum:" : "En son okuduğum:";

  return (
    <section className="mx-auto mt-12 w-full max-w-6xl px-4 sm:mt-16 sm:px-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Şu an dinliyorum — ambient senkron veya Spotify/manuel liste */}
        {useAmbient ? (
          <AmbientMusicPlayer />
        ) : (
          <GlassCard title="Şu an dinliyorum:">
            <ManualNowPlaying tracks={tracks} />
          </GlassCard>
        )}

        {/* Reading */}
        <GlassCard title={readingTitle}>
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              {reading?.cover_url ? (
                <Image
                  src={reading.cover_url}
                  alt="book cover"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white/90">
                {reading?.book_title ?? "—"}
              </p>
              <p className="truncate text-sm text-white/60">
                {reading?.author ?? " "}
              </p>

              {reading?.note ? (
                <p className="mt-2 line-clamp-2 text-xs text-white/55">
                  {reading.note}
                </p>
              ) : (
                <p className="mt-2 text-xs text-white/35">not: —</p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
