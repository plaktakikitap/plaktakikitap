"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Star } from "lucide-react";
import type { Video } from "@/types/videos";
import { parseYouTubeVideoId, getYouTubeThumbUrl } from "@/lib/works-utils";

function getThumb(v: Video): string {
  if (v.thumbnail_url?.startsWith("http")) return v.thumbnail_url;
  const id = parseYouTubeVideoId(v.youtube_url);
  return id ? getYouTubeThumbUrl(id) : "";
}

export function AdminVideosPanel({ initialVideos }: { initialVideos: Video[] }) {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ youtube_url: "", title: "", is_featured: false });

  useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  async function fetchVideos() {
    const res = await fetch("/api/admin/videos");
    if (res.ok) {
      const data = await res.json();
      setVideos(data);
    }
    router.refresh();
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const youtube_url = form.youtube_url.trim();
    if (!youtube_url) {
      setError("YouTube URL gerekli.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtube_url,
          title: form.title.trim() || undefined,
          is_featured: form.is_featured,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ekleme başarısız.");
        return;
      }
      setForm({ youtube_url: "", title: "", is_featured: false });
      await fetchVideos();
    } finally {
      setLoading(false);
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: !current }),
      });
      if (res.ok) await fetchVideos();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu videoyu silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
      if (res.ok) await fetchVideos();
      else setError("Silme başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-8">
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Plus className="h-4 w-4" />
          Yeni video ekle
        </h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">YouTube URL *</label>
            <input
              value={form.youtube_url}
              onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))}
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">Başlık (opsiyonel)</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              type="text"
              placeholder="Video başlığı"
              className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Öne çıkan (ana sayfa kartında göster)</span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
          >
            Ekle
          </button>
        </form>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Thumbnail otomatik oluşturulur. Sadece YouTube linki yeterli.
        </p>
      </section>

      <section>
        <h2 className="mb-4 font-medium">Videolar ({videos.length})</h2>
        {videos.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Henüz video yok.</p>
        ) : (
          <ul className="space-y-3">
            {videos.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/30 p-3"
              >
                <img
                  src={getThumb(v)}
                  alt=""
                  className="h-20 w-36 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{v.title || "—"}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{v.youtube_url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFeatured(v.id, v.is_featured)}
                  disabled={loading}
                  className={`rounded p-2 ${v.is_featured ? "text-amber-500" : "text-[var(--muted)] hover:text-amber-500"}`}
                  title={v.is_featured ? "Öne çıkan" : "Öne çıkan yap"}
                  aria-label={v.is_featured ? "Öne çıkan" : "Öne çıkan yap"}
                >
                  <Star className={`h-5 w-5 ${v.is_featured ? "fill-current" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(v.id)}
                  disabled={loading}
                  className="rounded p-2 text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                  aria-label="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
