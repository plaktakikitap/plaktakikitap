import { getManualNowPlayingList } from "@/lib/db/queries";
import { AdminNowPlaying } from "@/components/admin/AdminNowPlaying";

export default async function AdminNowPlayingPage() {
  const tracks = await getManualNowPlayingList();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 pt-24">
      <h1 className="text-2xl font-semibold tracking-tight">Şu an dinliyorum</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Spotify bağlı değilken gösterilecek manuel şarkılar. Bir tanesini &quot;aktif&quot; yap — ana sayfada o görünür.
      </p>
      <AdminNowPlaying tracks={tracks} />
    </div>
  );
}
