"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpsertTranslationIntro } from "@/app/admin/actions";

interface AdminTranslationIntroFormProps {
  initialText: string;
}

export function AdminTranslationIntroForm({ initialText }: AdminTranslationIntroFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await adminUpsertTranslationIntro(formData);
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
      <h3 className="text-lg font-semibold">Çeviriler sayfası giriş metni</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        /translations sayfasının en üstünde, Gold &amp; Glass çerçeve içinde gösterilir. Boş bırakırsanız intro bölümü görünmez.
      </p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-4">
        <label htmlFor="translation_intro" className="mb-1 block text-sm text-[var(--muted)]">
          Metin
        </label>
        <textarea
          id="translation_intro"
          name="translation_intro"
          rows={4}
          defaultValue={initialText}
          placeholder="Örn: Kitap çevirilerim ve yayımlanan kitaplar..."
          className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
      >
        {loading ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
