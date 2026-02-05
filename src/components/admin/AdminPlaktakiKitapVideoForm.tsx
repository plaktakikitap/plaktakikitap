"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

export function AdminPlaktakiKitapVideoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const video_title = (fd.get("video_title") as string)?.trim() ?? "";
    const youtube_url = (fd.get("youtube_url") as string)?.trim() ?? "";
    const description = (fd.get("description") as string)?.trim() ?? "";
    const custom_thumbnail = (fd.get("custom_thumbnail") as string)?.trim() ?? "";

    if (!youtube_url) {
      setError("YouTube URL gerekli.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: video_title,
          youtube_url,
          description: description || null,
          thumbnail_url: custom_thumbnail || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Video eklenemedi.");
        return;
      }
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
      <h2 className="mb-4 flex items-center gap-2 font-medium">
        <Plus className="h-4 w-4" />
        Yeni video ekle
      </h2>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>video_title</label>
          <input name="video_title" type="text" placeholder="Video başlığı" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>youtube_url *</label>
          <input name="youtube_url" type="url" required placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>description</label>
          <textarea name="description" rows={3} placeholder="Kisa aciklama (opsiyonel)" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>custom_thumbnail (URL)</label>
          <input name="custom_thumbnail" type="url" placeholder="https://... Özel kapak; boş bırakırsanız YouTube thumbnail kullanılır." className={inputClass} />
        </div>
        <button type="submit" disabled={loading} className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50">
          {loading ? "Ekleniyor…" : "Video ekle"}
        </button>
      </form>
    </section>
  );
}
