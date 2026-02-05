"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateTranslationsSettings } from "@/app/admin/actions";
import type { TranslationsSettingsRow } from "@/types/database";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

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
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6"
    >
      <h3 className="text-lg font-semibold">Çeviriler sayfası ayarları</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Giriş metni ve imza. Hepsi /translations sayfasında görünür.
      </p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-4 space-y-4">
        <div>
          <label className={labelClass}>intro_title</label>
          <input
            name="intro_title"
            defaultValue={settings?.intro_title ?? "Çevirilerim"}
            className={inputClass}
            placeholder="Çevirilerim"
          />
        </div>
        <div>
          <label className={labelClass}>intro_body (gerekli)</label>
          <textarea
            name="intro_body"
            rows={6}
            required
            defaultValue={settings?.intro_body ?? ""}
            className={inputClass}
            placeholder="Kısa deneme / giriş metni..."
          />
        </div>
        <div>
          <label className={labelClass}>intro_signature (imza)</label>
          <input
            name="intro_signature"
            defaultValue={settings?.intro_signature ?? ""}
            className={inputClass}
            placeholder="Eymen"
          />
        </div>
        <div>
          <label className={labelClass}>academia_profile_url</label>
          <input
            name="academia_profile_url"
            type="url"
            defaultValue={settings?.academia_profile_url ?? ""}
            className={inputClass}
            placeholder="https://academia.edu/..."
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-6 rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
      >
        {loading ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
