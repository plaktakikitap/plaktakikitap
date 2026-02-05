"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
interface SettingsRow {
  id: string;
  intro_text: string;
  youtube_channel_url: string;
  youtube_channel_id: string;
  spotify_profile_url: string | null;
  updated_at: string;
}

const inputClass = "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

export function AdminPlaktakiKitapSettingsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsRow | null>(null);

  useEffect(() => {
    fetch("/api/admin/plaktaki-kitap/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .catch(() => setSettings(null));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/plaktaki-kitap/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intro_text: (fd.get("intro_text") as string)?.trim() ?? "",
          youtube_channel_url: (fd.get("youtube_channel_url") as string)?.trim() ?? "",
          youtube_channel_id: (fd.get("youtube_channel_id") as string)?.trim() ?? "",
          spotify_profile_url: (fd.get("spotify_profile_url") as string)?.trim() || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Kaydedilemedi.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!settings) return <p className="text-sm text-[var(--muted)]">Yükleniyor…</p>;

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
      <h3 className="text-lg font-semibold">Ayarlar</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">Intro metni, YouTube kanalı ve Spotify linki.</p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-4">
        <label className={labelClass}>Intro metni</label>
        <textarea name="intro_text" rows={4} defaultValue={settings.intro_text} placeholder="Sayfa giriş metni" className={inputClass} />
      </div>
      <div className="mt-4">
        <label className={labelClass}>YouTube kanal URL</label>
        <input name="youtube_channel_url" type="url" defaultValue={settings.youtube_channel_url} placeholder="https://www.youtube.com/@..." className={inputClass} />
      </div>
      <div className="mt-4">
        <label className={labelClass}>YouTube kanal ID (abone sayısı API)</label>
        <input name="youtube_channel_id" type="text" defaultValue={settings.youtube_channel_id} placeholder="UC..." className={inputClass} />
      </div>
      <div className="mt-4">
        <label className={labelClass}>Spotify profil / podcast URL</label>
        <input name="spotify_profile_url" type="url" defaultValue={settings.spotify_profile_url ?? ""} placeholder="https://open.spotify.com/show/..." className={inputClass} />
      </div>
      <button type="submit" disabled={loading} className="mt-6 rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50">
        {loading ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
