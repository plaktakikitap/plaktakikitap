import { getVideosAdmin } from "@/lib/videos";
import { AdminVideosPanel } from "@/components/admin/AdminVideosPanel";

export default async function AdminVideosPage() {
  const videos = await getVideosAdmin();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-xl font-semibold">Videolar</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        YouTube linki ekle; thumbnail otomatik alınır. Öne çıkan video ana sayfa kartında gösterilir.
      </p>
      <AdminVideosPanel initialVideos={videos} />
    </div>
  );
}
