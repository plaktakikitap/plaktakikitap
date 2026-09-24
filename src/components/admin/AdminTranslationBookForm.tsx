"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateTranslationBook } from "@/app/secretgate/actions";
import type { TranslationBookRow } from "@/types/database";
import { AdminImageUpload } from "./AdminImageUpload";

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
    router.push("/secretgate/translations");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {error ? <p className="admin-error">{error}</p> : null}
      <div>
        <label className="admin-label">Başlık *</label>
        <input name="title" required defaultValue={book.title} className="admin-input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">Orijinal yazar *</label>
          <input name="original_author" required defaultValue={book.original_author} className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Yayınevi *</label>
          <input name="publisher" required defaultValue={book.publisher} className="admin-input" />
        </div>
      </div>
      <div>
        <label className="admin-label">Yıl</label>
        <input
          name="year"
          type="number"
          min="1900"
          max="2100"
          defaultValue={book.year ?? ""}
          className="admin-input"
        />
      </div>
      <div>
        <label className="admin-label">Kapak görseli</label>
        <AdminImageUpload name="cover_url" value={book.cover_url ?? ""} placeholder="Kapak yükle" />
      </div>
      <div>
        <label className="admin-label">Amazon URL</label>
        <input name="amazon_url" type="text" defaultValue={book.amazon_url ?? ""} className="admin-input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">Kaynak dil</label>
          <input name="source_lang" defaultValue={book.source_lang ?? ""} className="admin-input" maxLength={10} />
        </div>
        <div>
          <label className="admin-label">Hedef dil</label>
          <input name="target_lang" defaultValue={book.target_lang ?? ""} className="admin-input" maxLength={10} />
        </div>
      </div>
      <div>
        <label className="admin-label">Çevirmenin notu</label>
        <textarea
          name="translator_note"
          rows={4}
          defaultValue={book.translator_note ?? ""}
          className="admin-input min-h-[6rem]"
        />
      </div>
      <div>
        <label className="admin-label">Durum rozeti</label>
        <input
          name="status_badge"
          defaultValue={book.status_badge ?? ""}
          className="admin-input"
          placeholder="Çok Yakında"
        />
      </div>
      <div>
        <label className="admin-label">Sıra</label>
        <input name="order_index" type="number" defaultValue={book.order_index} className="admin-input" />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_released"
          name="is_released"
          defaultChecked={book.is_released}
          value="on"
          className="h-4 w-4 rounded border-[#e8e0d4]"
        />
        <label htmlFor="is_released" className="text-sm text-[#6b6158]">
          Yayında
        </label>
      </div>
      <div>
        <label className="admin-label">Tamamlanma %</label>
        <input
          name="completion_percentage"
          type="number"
          min={0}
          max={100}
          defaultValue={book.completion_percentage}
          className="admin-input"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="admin-btn-gold disabled:opacity-50">
          {loading ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/secretgate/translations")}
          className="rounded-xl border border-[#e8e0d4] px-4 py-2.5 text-sm text-[#1a1612]/65 transition-colors hover:border-[#d4c9bb] hover:text-[#1a1612]"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
