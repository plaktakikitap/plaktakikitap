"use client";

import { useRouter } from "next/navigation";
import { adminUpsertReadingGoal } from "@/app/admin/actions";
import { useState } from "react";

interface AdminReadingGoalFormProps {
  initial: {
    year: number;
    goal: number;
    read_count: number;
  } | null;
}

export function AdminReadingGoalForm({ initial }: AdminReadingGoalFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const year = initial?.year ?? new Date().getFullYear();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await adminUpsertReadingGoal(formData);
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
      <h3 className="text-lg font-semibold">Yıllık hedef</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Okuma günlüğü sayfasında &quot;X / Y kitap&quot; ve dairesel ilerleme çubuğu bu değerlerle hesaplanır.
      </p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">Yıl</label>
          <input
            name="year"
            type="number"
            min={2000}
            max={2100}
            defaultValue={year}
            className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">Hedef (kitap sayısı)</label>
          <input
            name="goal"
            type="number"
            min={0}
            defaultValue={initial?.goal ?? 12}
            className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">Okunan (bu yıl, hesaplanan)</label>
          <input
            type="number"
            min={0}
            value={initial?.read_count ?? 0}
            readOnly
            className="w-full rounded border border-[var(--input)] bg-[var(--muted)]/20 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Kaydediliyor..." : "Hedefi kaydet"}
      </button>
    </form>
  );
}
