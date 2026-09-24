"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateTranslationIndependent } from "@/app/secretgate/actions";
import type { TranslationIndependentRow } from "@/types/database";

export function AdminTranslationIndependentForm({ item }: { item: TranslationIndependentRow }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await adminUpdateTranslationIndependent(item.id, new FormData(e.currentTarget));
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
        <input name="title" required defaultValue={item.title} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">Açıklama</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={item.description ?? ""}
          className="admin-input min-h-[5rem]"
        />
      </div>
      <div>
        <label className="admin-label">Yıl</label>
        <input name="year" type="number" defaultValue={item.year ?? ""} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">Etiketler</label>
        <input name="tags" defaultValue={item.tags?.join(", ") ?? ""} className="admin-input" />
        <p className="admin-hint">Virgülle ayırın.</p>
      </div>
      <div>
        <label className="admin-label">Dış bağlantı</label>
        <input name="external_url" type="text" defaultValue={item.external_url ?? ""} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">PDF</label>
        <input name="file_url" type="text" defaultValue={item.file_url ?? ""} className="admin-input" />
        <input
          name="file_file"
          type="file"
          accept=".pdf,application/pdf"
          className="mt-2 text-sm text-[#6b6158]"
        />
      </div>
      <div>
        <label className="admin-label">Sıra</label>
        <input name="order_index" type="number" defaultValue={item.order_index} className="admin-input" />
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
