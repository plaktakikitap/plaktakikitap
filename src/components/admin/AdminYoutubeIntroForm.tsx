"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpsertYoutubeIntro } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

export function AdminYoutubeIntroForm({
  initialText,
  initialChannelUrl,
  initialChannelId,
  initialSpotifyUrl,
}: {
  initialText: string;
  initialChannelUrl: string;
  initialChannelId: string;
  initialSpotifyUrl: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await adminUpsertYoutubeIntro(new FormData(e.currentTarget));
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
      <h3 className="text-lg font-semibold">Dinamik header ve bağlantılar</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Giriş metni, canlı abone sayısı (YouTube API) ve Spotify podcast linki /plaktaki-kitap sayfasında gösterilir.
      </p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        <label htmlFor="youtube_intro" className={labelClass}>Giriş metni</label>
        <textarea
          id="youtube_intro"
          name="youtube_intro"
          rows={4}
          defaultValue={initialText}
          placeholder="Kanalımda kitap incelemeleri, edebiyat sohbetleri..."
          className={inputClass}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="youtube_channel_url" className={labelClass}>YouTube kanal URL (buton linki)</label>
        <input
          id="youtube_channel_url"
          name="youtube_channel_url"
          type="url"
          defaultValue={initialChannelUrl}
          placeholder="https://www.youtube.com/@..."
          className={inputClass}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="youtube_channel_id" className={labelClass}>YouTube kanal ID (canlı abone sayısı)</label>
        <input
          id="youtube_channel_id"
          name="youtube_channel_id"
          type="text"
          defaultValue={initialChannelId}
          placeholder="UCxxxxxxxxxxxxxxxxxxxxxxxxx"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-[var(--muted)]">
          Kanal sayfası URL’sindeki /channel/ veya /@ kullanıcı adından sonra gelen ID. Canlı istatistik için .env.local’de YOUTUBE_API_KEY gerekli.
        </p>
      </div>

      <div className="mt-4">
        <label htmlFor="spotify_url" className={labelClass}>Spotify podcast / profil URL</label>
        <input
          id="spotify_url"
          name="spotify_url"
          type="url"
          defaultValue={initialSpotifyUrl}
          placeholder="https://open.spotify.com/show/..."
          className={inputClass}
        />
        <p className="mt-1 text-xs text-[var(--muted)]">
          &quot;Sesli kitaplara Spotify&apos;dan da ulaşabilirsiniz!&quot; butonu bu linke yönlendirir.
        </p>
      </div>

      <button type="submit" disabled={loading} className="mt-6 rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50">
        {loading ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
