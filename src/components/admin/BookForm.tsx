"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBook } from "@/app/actions";

export function BookForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createBook(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/books");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium">Başlık *</label>
        <input
          name="title"
          required
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Yazar</label>
        <input
          name="author"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Slug</label>
        <input
          name="slug"
          placeholder="url-friendly-baslik"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Açıklama</label>
        <textarea
          name="description"
          rows={3}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Sayfa</label>
          <input
            name="pages"
            type="number"
            min={1}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Puan (0-10)</label>
          <input
            name="rating"
            type="number"
            step="0.1"
            min={0}
            max={10}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Görünürlük</label>
        <select
          name="visibility"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        >
          <option value="public">Herkes</option>
          <option value="unlisted">Gizli link</option>
          <option value="private">Sadece ben</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Kapak URL</label>
        <input
          name="cover_url"
          type="url"
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Alıntı</label>
        <textarea
          name="quote"
          rows={2}
          placeholder="Beğendiğiniz bir alıntı"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">İnceleme</label>
        <textarea
          name="review"
          rows={4}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Kaydet
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
