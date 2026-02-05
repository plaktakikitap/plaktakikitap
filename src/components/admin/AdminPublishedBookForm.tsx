"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdatePublishedBook } from "@/app/admin/actions";
import type { PublishedBook } from "@/types/database";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

export function AdminPublishedBookForm({ book }: { book: PublishedBook }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await adminUpdatePublishedBook(book.id, formData);
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
        <input
          name="title"
          required
          defaultValue={book.title}
          className={inputClass}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Yazar</label>
          <input name="author" defaultValue={book.author ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Yayınevi</label>
          <input name="publisher" defaultValue={book.publisher ?? ""} className={inputClass} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Yıl</label>
          <input
            name="year"
            type="number"
            min="1900"
            max="2100"
            defaultValue={book.year ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Sıra (order_index)</label>
          <input
            name="order_index"
            type="number"
            defaultValue={book.order_index}
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Kaynak dil (source_lang)</label>
          <input
            name="source_lang"
            defaultValue={book.source_lang ?? ""}
            placeholder="EN, FR, DE..."
            maxLength={10}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Hedef dil (target_lang)</label>
          <input
            name="target_lang"
            defaultValue={book.target_lang ?? ""}
            placeholder="TR"
            maxLength={10}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Çevirmenin notu (translator_note)</label>
        <textarea
          name="translator_note"
          rows={4}
          defaultValue={book.translator_note ?? ""}
          className={inputClass}
          placeholder="Modalda Çevirmenin Notu bölümünde gösterilir."
        />
      </div>
      <div>
        <label className={labelClass}>Tamamlanma % (0-100)</label>
        <input
          name="completion_percentage"
          type="number"
          min={0}
          max={100}
          defaultValue={book.completion_percentage ?? ""}
          className={inputClass}
          placeholder="100"
        />
      </div>
      <div>
        <label className={labelClass}>Kapak görseli URL</label>
        <input
          name="cover_image"
          type="url"
          defaultValue={book.cover_image ?? ""}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Amazon URL</label>
        <input
          name="amazon_url"
          type="url"
          defaultValue={book.amazon_url ?? ""}
          className={inputClass}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_released"
          name="is_released"
          defaultChecked={book.is_released}
          value="true"
          className="h-4 w-4 rounded border-[var(--card-border)]"
        />
        <label htmlFor="is_released" className="text-sm">
          Yayında (kapatırsanız Çok Yakında bandı görünür)
        </label>
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
