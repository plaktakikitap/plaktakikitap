"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreatePlannerDecor,
  adminDeletePlannerDecor,
} from "@/app/secretgate/actions";
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
    <section className="rounded-xl border border-[#d4c9bb] bg-[#1a1612]/5 p-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left font-medium text-[#1a1612]"
      >
        Süsler (sticker, bant, ataş)
        <span className="text-[#6b6158]">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {error && (
            <p className="rounded bg-red-500/10 px-2 py-1 text-sm text-red-400">
              {error}
            </p>
          )}

          {decors.length > 0 && (
            <ul className="space-y-2">
              {decors.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-[#d4c9bb] bg-[#1a1612]/5 px-3 py-2 text-sm text-[#1a1612]"
                >
                  <span>
                    {d.type} — {d.page} ({(d.x * 100).toFixed(0)}%,{(d.y * 100).toFixed(0)}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(d.id)}
                    className="rounded p-1 text-[#6b6158] hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {adding ? (
            <form action={handleAdd} className="space-y-2 rounded-lg border border-[#d4c9bb] p-3">
              <input type="hidden" name="year" value={year} />
              <input type="hidden" name="month" value={monthDb} />
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-[#1a1612]/70">Sayfa</label>
                <select name="page" className="rounded border border-[var(--card-border)] bg-white px-2 py-1 text-sm text-neutral-900" required>
                  <option value="left">Sol</option>
                  <option value="right">Sağ</option>
                </select>
                <label className="text-xs text-[#1a1612]/70">Tip</label>
                <select name="type" className="rounded border border-[var(--card-border)] bg-white px-2 py-1 text-sm text-neutral-900" required>
                  {DECOR_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <label className="text-xs text-[#1a1612]/70">X (0–1)</label>
                <input name="x" type="number" step="0.01" min="0" max="1" defaultValue="0.5" className="rounded border border-[var(--card-border)] bg-white px-2 py-1 text-sm text-neutral-900" />
                <label className="text-xs text-[#1a1612]/70">Y (0–1)</label>
                <input name="y" type="number" step="0.01" min="0" max="1" defaultValue="0.5" className="rounded border border-[var(--card-border)] bg-white px-2 py-1 text-sm text-neutral-900" />
                <label className="text-xs text-[#1a1612]/70">Rotation</label>
                <input name="rotation" type="number" defaultValue="0" className="rounded border border-[var(--card-border)] bg-white px-2 py-1 text-sm text-neutral-900" />
                <label className="text-xs text-[#1a1612]/70">Scale</label>
                <input name="scale" type="number" step="0.1" min="0.1" max="3" defaultValue="1" className="rounded border border-[var(--card-border)] bg-white px-2 py-1 text-sm text-neutral-900" />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-sm text-[#1a1612] hover:bg-amber-600"
                >
                  <Plus className="h-4 w-4" />
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="rounded border border-[#d4c9bb] px-3 py-1.5 text-sm text-[#1a1612] hover:bg-[#1a1612]/8"
                >
                  İptal
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-1 rounded-lg border border-dashed border-[#d4c9bb] px-3 py-2 text-sm text-[#1a1612]/70 hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
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
