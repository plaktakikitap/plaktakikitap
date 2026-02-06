"use client";

import { useRouter } from "next/navigation";
import {
  adminCreateManualTrack,
  adminDeleteManualTrack,
  adminSetActiveManualTrack,
} from "@/app/admin/actions";
import type { ManualNowPlayingItem } from "@/lib/db/queries";
import { AdminImageUpload } from "./AdminImageUpload";
import { Music, Plus, Trash2, Star } from "lucide-react";
import { useState } from "react";

interface AdminNowPlayingProps {
  tracks: ManualNowPlayingItem[];
}

export function AdminNowPlaying({ tracks }: AdminNowPlayingProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await adminCreateManualTrack(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    (e.target as HTMLFormElement).reset();
  }

  async function handleSetActive(id: string) {
    setLoading(true);
    await adminSetActiveManualTrack(id);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu şarkıyı silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await adminDeleteManualTrack(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-6">
      <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Plus className="h-4 w-4" />
          Yeni şarkı ekle
        </h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">Şarkı adı</label>
            <input
              name="title"
              type="text"
              required
              className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="Song title"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">Sanatçı</label>
            <input
              name="artist"
              type="text"
              required
              className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="Artist name"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-[var(--muted)]">Albüm kapağı (isteğe bağlı)</label>
            <AdminImageUpload
              name="album_art_url"
              placeholder="Albüm kapağı yükle"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-[var(--muted)]">Spotify / dinleme linki (isteğe bağlı)</label>
            <input
              name="track_url"
              type="url"
              className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="https://open.spotify.com/..."
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              name="is_active"
              type="checkbox"
              id="is_active_new"
              className="rounded border-[var(--input)]"
            />
            <label htmlFor="is_active_new" className="text-sm">
              Hemen aktif yap (ana sayfada göster)
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Ekleniyor…" : "Ekle"}
        </button>
      </form>

      <div>
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Music className="h-4 w-4" />
          Eklenen şarkılar ({tracks.length})
        </h2>
        {tracks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)]/30 p-8 text-center text-sm text-[var(--muted)]">
            Henüz şarkı eklenmedi.
          </p>
        ) : (
          <ul className="space-y-3">
            {tracks.map((t) => (
              <li
                key={t.id}
                className={`flex items-center gap-4 rounded-xl border p-4 ${
                  t.is_active ? "border-[var(--accent)] bg-[var(--accent-soft)]/20" : "border-[var(--card-border)] bg-[var(--card)]/50"
                }`}
              >
                {t.album_art_url ? (
                  <img src={t.album_art_url} alt="" className="h-14 w-14 rounded object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded bg-[var(--muted)]/30">
                    <Music className="h-6 w-6 text-[var(--muted)]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-sm text-[var(--muted)]">{t.artist}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!t.is_active && (
                    <button
                      type="button"
                      onClick={() => handleSetActive(t.id)}
                      disabled={loading}
                      className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-[var(--accent)] hover:bg-[var(--accent-soft)]/50"
                      title="Aktif yap"
                    >
                      <Star className="h-4 w-4" />
                      Aktif
                    </button>
                  )}
                  {t.is_active && (
                    <span className="rounded bg-[var(--accent)]/20 px-3 py-1 text-xs font-medium text-[var(--accent)]">
                      Şu an gösteriliyor
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    disabled={loading}
                    className="rounded p-1.5 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-600"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
