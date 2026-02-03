"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreatePlannerDecor,
  adminDeletePlannerDecor,
} from "@/app/admin/actions";
import type { PlannerDecor } from "@/lib/planner";
import { Plus, Trash2 } from "lucide-react";

const MONTH_NAMES_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const DECOR_TYPES = [
  { value: "sticker", label: "Sticker" },
  { value: "tape", label: "Bant" },
  { value: "paperclip", label: "Ataş" },
  { value: "pin", label: "Pin" },
] as const;

interface AdminPlannerDecorProps {
  year: number;
  monthIndex: number;
}

export function AdminPlannerDecor({ year, monthIndex }: AdminPlannerDecorProps) {
  const router = useRouter();
  const [decors, setDecors] = useState<PlannerDecor[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/planner/decor?year=${year}&month=${monthIndex}`)
      .then((r) => r.json())
      .then(setDecors)
      .catch(() => setDecors([]));
  }, [year, monthIndex]);

  const monthDb = monthIndex + 1;

  async function handleAdd(formData: FormData) {
    setError(null);
    formData.set("year", String(year));
    formData.set("month", String(monthDb));
    const r = await adminCreatePlannerDecor(formData);
    if ("error" in r) {
      setError(r.error);
    } else {
      setAdding(false);
      router.refresh();
      fetch(`/api/planner/decor?year=${year}&month=${monthIndex}`)
        .then((res) => res.json())
        .then(setDecors);
    }
  }

  async function handleDelete(id: string) {
    await adminDeletePlannerDecor(id);
    router.refresh();
    setDecors((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left font-medium"
      >
        Süsler (sticker, bant, ataş)
        <span className="text-[var(--muted)]">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {error && (
            <p className="rounded bg-red-500/10 px-2 py-1 text-sm text-red-600">
              {error}
            </p>
          )}

          {decors.length > 0 && (
            <ul className="space-y-2">
              {decors.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <span>
                    {d.type} — {d.page} ({(d.x * 100).toFixed(0)}%,{(d.y * 100).toFixed(0)}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(d.id)}
                    className="rounded p-1 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-600"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {adding ? (
            <form action={handleAdd} className="space-y-2 rounded-lg border border-[var(--card-border)] p-3">
              <input type="hidden" name="year" value={year} />
              <input type="hidden" name="month" value={monthDb} />
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-[var(--muted)]">Sayfa</label>
                <select name="page" className="rounded border px-2 py-1 text-sm" required>
                  <option value="left">Sol</option>
                  <option value="right">Sağ</option>
                </select>
                <label className="text-xs text-[var(--muted)]">Tip</label>
                <select name="type" className="rounded border px-2 py-1 text-sm" required>
                  {DECOR_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <label className="text-xs text-[var(--muted)]">X (0–1)</label>
                <input name="x" type="number" step="0.01" min="0" max="1" defaultValue="0.5" className="rounded border px-2 py-1 text-sm" />
                <label className="text-xs text-[var(--muted)]">Y (0–1)</label>
                <input name="y" type="number" step="0.01" min="0" max="1" defaultValue="0.5" className="rounded border px-2 py-1 text-sm" />
                <label className="text-xs text-[var(--muted)]">Rotation</label>
                <input name="rotation" type="number" defaultValue="0" className="rounded border px-2 py-1 text-sm" />
                <label className="text-xs text-[var(--muted)]">Scale</label>
                <input name="scale" type="number" step="0.1" min="0.1" max="3" defaultValue="1" className="rounded border px-2 py-1 text-sm" />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm text-white"
                >
                  <Plus className="h-4 w-4" />
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="rounded border px-3 py-1.5 text-sm"
                >
                  İptal
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-1 rounded-lg border border-dashed border-[var(--card-border)] px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
            >
              <Plus className="h-4 w-4" />
              Süs ekle
            </button>
          )}
        </div>
      )}
    </section>
  );
}
