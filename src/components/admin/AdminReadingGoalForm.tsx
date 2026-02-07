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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="admin-heading text-lg font-semibold text-white/95">Yıllık okuma hedefi</h3>
        <p className="mt-2 text-sm text-white/55">
          Okuma günlüğü sayfasında &quot;X / Y kitap&quot; ve dairesel ilerleme çubuğu bu değerlerle hesaplanır.
        </p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/70">Yıl</label>
          <input
            name="year"
            type="number"
            min={2000}
            max={2100}
            defaultValue={year}
            className="admin-input"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/70">Hedef (kitap sayısı)</label>
          <input
            name="goal"
            type="number"
            min={0}
            defaultValue={initial?.goal ?? 12}
            className="admin-input"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/70">Okunan (bu yıl)</label>
          <input
            type="number"
            min={0}
            value={initial?.read_count ?? 0}
            readOnly
            className="admin-input cursor-not-allowed opacity-70"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="admin-btn-gold w-full sm:w-auto px-6 py-2.5 disabled:opacity-50"
      >
        {loading ? "Kaydediliyor..." : "Hedefi kaydet"}
      </button>
    </form>
  );
}
