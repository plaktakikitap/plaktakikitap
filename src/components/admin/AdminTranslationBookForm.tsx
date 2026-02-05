"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateTranslationBook } from "@/app/admin/actions";
import type { TranslationBookRow } from "@/types/database";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

export function AdminTranslationBookForm({ book }: { book: TranslationBookRow }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await adminUpdateTranslationBook(book.id, formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/translations");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className={labelClass}>Başlık *</label>
        <input name="title" required defaultValue={book.title} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Orijinal yazar *</label>
          <input name="original_author" required defaultValue={book.original_author} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Yayınevi *</label>
          <input name="publisher" required defaultValue={book.publisher} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Yıl</label>
        <input name="year" type="number" min="1900" max="2100" defaultValue={book.year ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Kapak URL (veya yeni dosya yükle)</label>
        <input name="cover_url" type="url" defaultValue={book.cover_url} className={inputClass} />
        <input name="cover_file" type="file" accept="image/*" className="mt-2 text-sm" />
      </div>
      <div>
        <label className={labelClass}>Amazon URL</label>
        <input name="amazon_url" type="url" defaultValue={book.amazon_url ?? ""} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Kaynak dil</label>
          <input name="source_lang" defaultValue={book.source_lang ?? ""} className={inputClass} maxLength={10} />
        </div>
        <div>
          <label className={labelClass}>Hedef dil</label>
          <input name="target_lang" defaultValue={book.target_lang ?? ""} className={inputClass} maxLength={10} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Çevirmenin notu</label>
        <textarea name="translator_note" rows={4} defaultValue={book.translator_note ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>status_badge</label>
        <input name="status_badge" defaultValue={book.status_badge ?? ""} className={inputClass} placeholder="Çok Yakında" />
      </div>
      <div>
        <label className={labelClass}>Sıra (order_index)</label>
        <input name="order_index" type="number" defaultValue={book.order_index} className={inputClass} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_released"
          name="is_released"
          defaultChecked={book.is_released}
          value="on"
          className="h-4 w-4 rounded border-[var(--card-border)]"
        />
        <label htmlFor="is_released" className="text-sm">
          Yayında
        </label>
      </div>
      <div>
        <label className={labelClass}>Tamamlanma % (0-100, yayında değilken)</label>
        <input
          name="completion_percentage"
          type="number"
          min={0}
          max={100}
          defaultValue={book.completion_percentage}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
      >
        {loading ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
