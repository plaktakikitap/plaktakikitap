"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateTranslationIndependent } from "@/app/admin/actions";
import type { TranslationIndependentRow } from "@/types/database";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

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
    router.push("/admin/translations");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className={labelClass}>Başlık *</label>
        <input name="title" required defaultValue={item.title} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Açıklama</label>
        <textarea name="description" rows={3} defaultValue={item.description ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Yıl</label>
        <input name="year" type="number" defaultValue={item.year ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Etiketler (virgülle)</label>
        <input name="tags" defaultValue={item.tags?.join(", ") ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>external_url</label>
        <input name="external_url" type="url" defaultValue={item.external_url ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>file_url (veya yeni PDF yükle)</label>
        <input name="file_url" type="url" defaultValue={item.file_url ?? ""} className={inputClass} />
        <input name="file_file" type="file" accept=".pdf,application/pdf" className="mt-2 text-sm" />
      </div>
      <div>
        <label className={labelClass}>order_index</label>
        <input name="order_index" type="number" defaultValue={item.order_index} className={inputClass} />
      </div>
      <button type="submit" disabled={loading} className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50">
        Kaydet
      </button>
    </form>
  );
}
