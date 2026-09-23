"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { Aliskanlik, AliskanlikKayit } from "@/types/takip";
import { showAdminToast } from "./admin-toast-events";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function calcStreak(
  logs: AliskanlikKayit[],
  habitId: string,
  today: string
): number {
  const done = new Set(
    logs
      .filter((l) => l.aliskanlik_id === habitId && l.tamamlandi)
      .map((l) => l.tarih)
  );
  let streak = 0;
  const d = new Date(today + "T12:00:00");
  if (!done.has(today)) d.setDate(d.getDate() - 1);
  for (;;) {
    const iso = d.toISOString().slice(0, 10);
    if (!done.has(iso)) break;
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function AdminAliskanliklarPanel({
  initialHabits,
  initialLogs,
}: {
  initialHabits: Aliskanlik[];
  initialLogs: AliskanlikKayit[];
}) {
  const router = useRouter();
  const today = todayISO();
  const [habits, setHabits] = useState(initialHabits);
  const [logs, setLogs] = useState(initialLogs);
  const [showNew, setShowNew] = useState(false);
  const [ad, setAd] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [loading, setLoading] = useState(false);

  const active = habits.filter((h) => h.aktif);

  const doneToday = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const l of logs) {
      if (l.tarih === today) m.set(l.aliskanlik_id, l.tamamlandi);
    }
    return m;
  }, [logs, today]);

  const heatmapDays = useMemo(() => {
    const days: { iso: string; ratio: number }[] = [];
    const activeIds = new Set(active.map((h) => h.id));
    const total = activeIds.size || 1;
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const done = logs.filter(
        (l) =>
          l.tarih === iso &&
          l.tamamlandi &&
          activeIds.has(l.aliskanlik_id)
      ).length;
      days.push({ iso, ratio: done / total });
    }
    return days;
  }, [logs, active]);

  async function createHabit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/aliskanliklar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ad,
          aciklama: aciklama.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error || "Eklenemedi.");
        return;
      }
      setHabits((prev) => [...prev, data]);
      setAd("");
      setAciklama("");
      setShowNew(false);
      showAdminToast("success", "Alışkanlık eklendi ✓");
      router.refresh();
    } catch {
      showAdminToast("error", "Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  async function toggle(habitId: string, next: boolean) {
    const res = await fetch("/api/admin/aliskanliklar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle",
        aliskanlik_id: habitId,
        tarih: today,
        tamamlandi: next,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAdminToast("error", data.error || "Güncellenemedi.");
      return;
    }
    setLogs((prev) => {
      const rest = prev.filter(
        (l) => !(l.aliskanlik_id === habitId && l.tarih === today)
      );
      return [...rest, data];
    });
  }

  async function deactivate(id: string) {
    if (!confirm("Alışkanlığı gizle? Veriler silinmez.")) return;
    const res = await fetch("/api/admin/aliskanliklar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-aktif", id, aktif: false }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAdminToast("error", data.error || "Güncellenemedi.");
      return;
    }
    setHabits((prev) => prev.map((h) => (h.id === id ? data : h)));
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-white/50">
          {new Date(today + "T12:00:00").toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <button
          type="button"
          onClick={() => setShowNew((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs text-white/70 hover:bg-white/5"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni alışkanlık
        </button>
      </div>

      {showNew ? (
        <form
          onSubmit={createHabit}
          className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
        >
          <input
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            placeholder="Örn: Sabah kitap oku"
            required
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
          />
          <input
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            placeholder="Açıklama (opsiyonel)"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm text-black disabled:opacity-50"
          >
            Kaydet
          </button>
        </form>
      ) : null}

      <ul className="space-y-2">
        {active.length === 0 ? (
          <li className="text-sm text-white/40">Henüz alışkanlık yok.</li>
        ) : (
          active.map((h) => {
            const done = doneToday.get(h.id) ?? false;
            const streak = calcStreak(logs, h.id, today);
            return (
              <li
                key={h.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={done}
                  onChange={(e) => void toggle(h.id, e.target.checked)}
                  className="h-5 w-5 accent-amber-500"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      done ? "text-white/45 line-through" : "text-white/90"
                    }`}
                  >
                    {h.ad}
                  </p>
                  {h.aciklama ? (
                    <p className="text-[11px] text-white/35">{h.aciklama}</p>
                  ) : null}
                </div>
                {streak > 0 ? (
                  <span className="shrink-0 text-xs text-amber-400/90">
                    🔥 {streak} gün
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => void deactivate(h.id)}
                  className="text-[10px] text-white/25 hover:text-white/50"
                >
                  Gizle
                </button>
              </li>
            );
          })
        )}
      </ul>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="mb-3 text-sm text-white/60">Son 90 gün — tamamlama</h3>
        <div className="flex flex-wrap gap-1">
          {heatmapDays.map((d) => (
            <div
              key={d.iso}
              title={`${d.iso}: %${Math.round(d.ratio * 100)}`}
              className="h-3 w-3 rounded-sm"
              style={{
                background:
                  d.ratio === 0
                    ? "rgba(255,255,255,0.06)"
                    : `rgba(212,175,55,${0.25 + d.ratio * 0.7})`,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
