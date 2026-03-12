import { getMusicTracksAdmin } from "@/lib/music";
import { getSiteSettings } from "@/lib/site-settings";
import { AdminMusicPanel } from "@/components/admin/AdminMusicPanel";

export default async function AdminMusicPage() {
  const [tracks, settings] = await Promise.all([
    getMusicTracksAdmin(),
    getSiteSettings(),
  ]);
  const startedAt = settings.music_playlist_started_at ?? null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 pt-24">
      <h1 className="text-2xl font-semibold tracking-tight">Ambient müzik</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        MP3 yükleyin; playlist tek bir global zamandan itibaren herkese senkron çalar. Ziyaretçi &quot;Benimle birlikte dinlemeye devam edebilirsin&quot; deyince kaldığı yerden dinler.
      </p>
      <AdminMusicPanel
        tracks={tracks}
        playlistStartedAt={startedAt}
      />
    </div>
  );
}
