import { getManualNowPlayingList } from "@/lib/db/queries";
import { getMusicTracksAdmin } from "@/lib/music";
import { getSiteSettings } from "@/lib/site-settings";
import { AdminNowPlaying } from "@/components/admin/AdminNowPlaying";
import { AdminMusicPanel } from "@/components/admin/AdminMusicPanel";
import type { ManualNowPlayingItem } from "@/lib/db/queries";
import type { MusicTrackRow } from "@/types/database";

export default async function AdminNowPlayingPage() {
  let tracks: ManualNowPlayingItem[] = [];
  let musicTracks: MusicTrackRow[] = [];
  let playlistStartedAt: string | null = null;

  try {
    const [tracksData, musicTracksData, settings] = await Promise.all([
      getManualNowPlayingList(),
      getMusicTracksAdmin(),
      getSiteSettings(),
    ]);
    tracks = tracksData ?? [];
    musicTracks = musicTracksData ?? [];
    playlistStartedAt = settings?.music_playlist_started_at ?? null;
  } catch {
    // Tablo/ortam yoksa sayfa yine açılsın; boş listelerle devam et
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 pt-24">
      <h1 className="text-2xl font-semibold tracking-tight">Şu an dinliyorum</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Ana sayfada müzik kartı: manuel şarkı listesi, Spotify playlist veya senkron ambient (MP3). Aşağıda hepsini yönetebilirsiniz.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Manuel şarkı listesi</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Şarkı adı ve sanatçı; isteğe bağlı MP3 yükleyebilirsiniz (play ile çalar). Bir tanesini &quot;aktif&quot; yap — ana sayfada o görünür.
        </p>
        <AdminNowPlaying tracks={tracks} />
      </section>

      <section className="mt-14">
        <h2 className="text-lg font-medium">Senkron ambient (MP3 playlist)</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          MP3 yükleyin; playlist tek bir global zamandan itibaren herkese senkron çalar.
        </p>
        <AdminMusicPanel
          tracks={musicTracks}
          playlistStartedAt={playlistStartedAt}
        />
      </section>
    </div>
  );
}
