import Image from "next/image";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { getPlaylistTracksForNowPlaying } from "@/lib/spotify";
import { getMusicCurrentState } from "@/lib/music";
import ManualNowPlaying from "./ManualNowPlaying";
import { AmbientMusicPlayer } from "./AmbientMusicPlayer";
import type { NowPlayingTrack } from "@/lib/spotify";

/** Admin panelde eklenen şarkılar manual_now_playing tablosunda; sırayla gösterilmek üzere buradan alıyoruz. */
async function getNowTracks(): Promise<NowPlayingTrack[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("manual_now_playing")
    .select("id, title, artist, album_art_url, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as { id: string; title: string; artist: string; album_art_url: string | null }[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    artist: r.artist,
    duration_sec: 180,
    cover_url: r.album_art_url,
  }));
}

async function getReading() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("books")
    .select("title, author, cover_url, progress_percent, last_progress_update_at")
    .eq("status", "reading")
    .order("last_progress_update_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    book_title: data.title,
    author: data.author,
    cover_url: data.cover_url,
    note: null,
    updated_at: data.last_progress_update_at,
  };
}

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
  const [musicState, playlistId, reading] = await Promise.all([
    getMusicCurrentState(),
    Promise.resolve((process.env.SPOTIFY_PLAYLIST_ID ?? "").trim()),
    getReading(),
  ]);
  const useAmbient =
    musicState.tracks.length > 0 &&
    musicState.startedAt != null &&
    musicState.startedAt !== "";

  const playlistTracks =
    playlistId.length > 0 ? await getPlaylistTracksForNowPlaying(playlistId) : [];
  const tracks =
    playlistTracks.length > 0
      ? playlistTracks
      : await getNowTracks();
  const playlistUrl = playlistId
    ? `https://open.spotify.com/playlist/${playlistId}`
    : null;

  const readingTitle = reading ? "Şu an okuyorum:" : "En son okuduğum:";

  return (
    <section className="mx-auto mt-12 w-full max-w-6xl px-4 sm:mt-16 sm:px-6">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-white/90">Şu an</h3>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Şu an dinliyorum — ambient senkron veya Spotify/manuel liste */}
        {useAmbient ? (
          <AmbientMusicPlayer />
        ) : (
          <GlassCard title="Şu an dinliyorum:">
            <ManualNowPlaying tracks={tracks} />
            {playlistUrl && tracks.length > 0 && (
              <p className="mt-3 text-center">
                <Link
                  href={playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 underline decoration-white/30 hover:text-white/80"
                >
                  Playlisti Spotify&apos;da dinle
                </Link>
              </p>
            )}
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
