"use client";

import { useRouter } from "next/navigation";
import { adminUpsertReadingStatus } from "@/app/admin/actions";
import { AdminImageUpload } from "./AdminImageUpload";
import { useState } from "react";

interface AdminReadingFormProps {
  initial: {
    book_title: string;
    author: string | null;
    cover_url: string | null;
    note: string | null;
    status: string;
    progress_percent: number | null;
  } | null;
}

export function AdminReadingForm({ initial }: AdminReadingFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await adminUpsertReadingStatus(formData);
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
      className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6"
    >
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">
            Kitap adı *
          </label>
          <input
            name="book_title"
            type="text"
            required
            defaultValue={initial?.book_title ?? ""}
            className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
            placeholder="Kitap adı"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">
            Yazar (isteğe bağlı)
          </label>
          <input
            name="author"
            type="text"
            defaultValue={initial?.author ?? ""}
            className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
            placeholder="Yazar adı"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">
            Kapak görseli (isteğe bağlı)
          </label>
          <AdminImageUpload
            name="cover_url"
            value={initial?.cover_url ?? ""}
            placeholder="Kapak yükle"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">
            İlerleme (%) — sadece &quot;Şu an okuyorum&quot; için
          </label>
          <input
            name="progress_percent"
            type="number"
            min={0}
            max={100}
            defaultValue={initial?.progress_percent ?? ""}
            className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
            placeholder="0–100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">
            Durum
          </label>
          <select
            name="status"
            defaultValue={initial?.status ?? "reading"}
            className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <option value="reading">Şu an okuyorum</option>
            <option value="last">En son okuduğum</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">
            Not (isteğe bağlı)
          </label>
          <textarea
            name="note"
            rows={3}
            defaultValue={initial?.note ?? ""}
            className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
            placeholder="Kısa not..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
