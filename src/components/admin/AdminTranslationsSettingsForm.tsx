"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateTranslationsSettings } from "@/app/secretgate/actions";
import type { TranslationsSettingsRow } from "@/types/database";

export function AdminTranslationsSettingsForm({
  settings,
}: {
  settings: TranslationsSettingsRow | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await adminUpdateTranslationsSettings(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="admin-bento-card space-y-4 p-5 sm:p-6">
      <p className="text-sm text-[#6b6158]">
        Giriş metni ve imza. /translations sayfasının en üstünde görünür.
      </p>
      {error ? <p className="admin-error">{error}</p> : null}
      <div>
        <label className="admin-label">Başlık</label>
        <input
          name="intro_title"
          defaultValue={settings?.intro_title ?? "Çevirilerim"}
          className="admin-input"
          placeholder="Çevirilerim"
        />
      </div>
      <div>
        <label className="admin-label">Giriş metni *</label>
        <textarea
          name="intro_body"
          rows={6}
          required
          defaultValue={settings?.intro_body ?? ""}
          className="admin-input min-h-[8rem]"
          placeholder="Kısa deneme / giriş metni…"
        />
      </div>
      <div>
        <label className="admin-label">İmza</label>
        <input
          name="intro_signature"
          defaultValue={settings?.intro_signature ?? ""}
          className="admin-input"
          placeholder="Eymen"
        />
      </div>
      <div>
        <label className="admin-label">Academia profil URL</label>
        <input
          name="academia_profile_url"
          type="text"
          defaultValue={settings?.academia_profile_url ?? ""}
          className="admin-input"
          placeholder="https://academia.edu/..."
        />
      </div>
      <button type="submit" disabled={loading} className="admin-btn-gold disabled:opacity-50">
        {loading ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
