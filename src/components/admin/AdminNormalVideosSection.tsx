"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Video } from "@/types/videos";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

export function AdminNormalVideosSection({ videos }: { videos: Video[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "normal_video",
          title: (fd.get("title") as string)?.trim() ?? "",
          description: (fd.get("description") as string)?.trim() || null,
          youtube_url: (fd.get("youtube_url") as string)?.trim() ?? "",
          thumbnail_url: (fd.get("thumbnail_url") as string)?.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Eklenemedi.");
        return;
      }
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string, payload: { title?: string; description?: string | null; youtube_url?: string; thumbnail_url?: string | null }) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Güncellenemedi.");
        return;
      }
      setEditingId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu videoyu silmek istediğinize emin misiniz?")) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Silinemedi.");
        return;
      }
      setEditingId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
      <h2 className="mb-4 flex items-center gap-2 font-medium">Normal videolar</h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Başlık, Açıklama, YouTube URL, Özel Thumbnail. /plaktaki-kitap ve /videos sayfalarında listelenir.
      </p>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleAdd} className="mb-6 space-y-4">
        <div>
          <label className={labelClass}>Başlık</label>
          <input name="title" type="text" placeholder="Video başlığı" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Açıklama</label>
          <textarea name="description" rows={2} placeholder="Kısa açıklama (opsiyonel)" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>YouTube URL *</label>
          <input name="youtube_url" type="url" required placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Özel Thumbnail (URL)</label>
          <input name="thumbnail_url" type="url" placeholder="Boş bırakırsanız YouTube kapağı kullanılır." className={inputClass} />
        </div>
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50">
          <Plus className="h-4 w-4" /> Yeni video ekle
        </button>
      </form>

      <ul className="space-y-2">
        {videos.length === 0 && <li className="text-sm text-[var(--muted)]">Henüz normal video yok.</li>}
        {videos.map((v) => (
          <li key={v.id} className="rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 p-3">
            {editingId === v.id ? (
              <EditForm
                video={v}
                onSave={(payload) => handleUpdate(v.id, payload)}
                onCancel={() => setEditingId(null)}
                disabled={loading}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{v.title || "—"}</p>
                  {v.description && <p className="text-xs text-[var(--muted)] line-clamp-1">{v.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setEditingId(v.id)} className="rounded p-2 text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]" aria-label="Düzenle">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(v.id)} className="rounded p-2 text-[var(--muted)] hover:bg-red-500/20 hover:text-red-600" aria-label="Sil">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function EditForm({
  video,
  onSave,
  onCancel,
  disabled,
}: {
  video: Video;
  onSave: (p: { title?: string; description?: string | null; youtube_url?: string; thumbnail_url?: string | null }) => void;
  onCancel: () => void;
  disabled: boolean;
}) {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description ?? "");
  const [youtube_url, setYoutubeUrl] = useState(video.youtube_url);
  const [thumbnail_url, setThumbnailUrl] = useState(video.thumbnail_url ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ title, description: description || null, youtube_url, thumbnail_url: thumbnail_url || null });
      }}
      className="space-y-3"
    >
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" className={inputClass} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Açıklama" className={inputClass} />
      <input type="url" value={youtube_url} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="YouTube URL" className={inputClass} />
      <input type="url" value={thumbnail_url} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="Özel Thumbnail URL" className={inputClass} />
      <div className="flex gap-2">
        <button type="submit" disabled={disabled} className="rounded bg-[var(--primary)] px-3 py-1.5 text-sm text-[var(--primary-foreground)] disabled:opacity-50">Kaydet</button>
        <button type="button" onClick={onCancel} className="rounded border border-[var(--card-border)] px-3 py-1.5 text-sm">İptal</button>
      </div>
    </form>
  );
}
