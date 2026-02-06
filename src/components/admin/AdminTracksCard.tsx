interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  duration_sec: number | null;
  sort_order: number;
  is_active: boolean;
}

import { AdminImageUpload } from "./AdminImageUpload";

export function AdminTracksCard({ tracks }: { tracks: Track[] }) {
  return (
    <div className="h-full">
      <h3 className="admin-heading mb-5 text-sm font-medium text-white/70">
        Müzikler (Şu an dinliyorum)
      </h3>
      <form action="/api/admin/tracks/add" method="POST" className="space-y-4">
        <input
          name="title"
          placeholder="Şarkı adı *"
          className="admin-input"
          required
        />
        <input
          name="artist"
          placeholder="Sanatçı *"
          className="admin-input"
          required
        />
        <AdminImageUpload
          name="cover_url"
          placeholder="Kapak görseli (opsiyonel)"
        />
        <div className="flex gap-3">
          <input
            name="duration_sec"
            type="number"
            placeholder="Süre (sn)"
            className="admin-input flex-1"
          />
          <input
            name="sort_order"
            type="number"
            placeholder="Sıra"
            className="admin-input w-24"
          />
        </div>
        <button type="submit" className="admin-btn-gold w-full">
          Ekle
        </button>
      </form>
      <div className="mt-6 space-y-3">
        {tracks.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-white/10">
              {t.cover_url && (
                <img src={t.cover_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1 truncate text-xs">
              <span className="font-medium">{t.title}</span>
              <span className="text-[var(--muted-foreground)]"> · {t.artist}</span>
            </div>
            <div className="flex shrink-0 gap-1">
              <form action="/api/admin/tracks/toggle" method="POST">
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className="text-[10px] text-white/50 hover:text-white">
                  {t.is_active ? "pasif" : "aktif"}
                </button>
              </form>
              <form action="/api/admin/tracks/delete" method="POST">
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className="text-[10px] text-red-400 hover:text-red-500">sil</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
