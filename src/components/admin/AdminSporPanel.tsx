"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Zap } from "lucide-react";
import type { SporKayit } from "@/types/takip";
import { showAdminToast } from "./admin-toast-events";

const AKTIVITELER = [
  "Koşu",
  "Yürüyüş",
  "Dans",
  "Pilates",
  "Yoga",
  "Spor Salonu",
  "Bisiklet",
  "Yüzme",
  "Diğer",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AdminSporPanel({
  initialItems,
}: {
  initialItems: SporKayit[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [aktivite, setAktivite] = useState("Koşu");
  const [sure, setSure] = useState("");
  const [mesafe, setMesafe] = useState("");
  const [enerji, setEnerji] = useState(3);
  const [notlar, setNotlar] = useState("");
  const [loading, setLoading] = useState(false);

  const monthStats = useMemo(() => {
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const monthItems = items.filter((i) => i.tarih >= from);
    const days = new Set(monthItems.map((i) => i.tarih));
    const counts = new Map<string, number>();
    let totalMin = 0;
    for (const i of monthItems) {
      counts.set(i.aktivite, (counts.get(i.aktivite) ?? 0) + 1);
      totalMin += i.sure_dakika ?? 0;
    }
    let top = "—";
    let topN = 0;
    for (const [k, v] of counts) {
      if (v > topN) {
        top = k;
        topN = v;
      }
    }
    return {
      days: days.size,
      top,
      totalMin,
    };
  }, [items]);

  const heatmap = useMemo(() => {
    const cells: { iso: string; count: number; tip: string }[] = [];
    const byDate = new Map<string, SporKayit[]>();
    for (const i of items) {
      const list = byDate.get(i.tarih) ?? [];
      list.push(i);
      byDate.set(i.tarih, list);
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 90);
    // Align to Monday
    const startDay = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - startDay);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0, 10);
      const list = byDate.get(iso) ?? [];
      cells.push({
        iso,
        count: list.length,
        tip: list.length
          ? list.map((x) => `${x.aktivite}${x.sure_dakika ? ` ${x.sure_dakika}dk` : ""}`).join(", ")
          : iso,
      });
    }
    return cells;
  }, [items]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/spor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tarih: todayISO(),
          aktivite,
          sure_dakika: sure ? Number(sure) : null,
          mesafe_km: mesafe ? Number(mesafe) : null,
          enerji_seviyesi: enerji,
          notlar: notlar.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error || "Kaydedilemedi.");
        return;
      }
      setItems((prev) => [data, ...prev]);
      setSure("");
      setMesafe("");
      setNotlar("");
      showAdminToast("success", "Spor kaydı eklendi ✓");
      router.refresh();
    } catch {
      showAdminToast("error", "Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Silinsin mi?")) return;
    const res = await fetch(`/api/admin/spor/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showAdminToast("error", "Silinemedi.");
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5"
      >
        <div className="flex flex-wrap gap-2">
          {AKTIVITELER.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAktivite(a)}
              className={`rounded-xl px-3 py-1.5 text-xs transition ${
                aktivite === a
                  ? "bg-amber-500 text-black"
                  : "bg-[#1a1612]/5 text-[#6b6158] hover:bg-[#1a1612]/8"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-[#6b6158]">Süre (dk)</label>
            <input
              type="number"
              min={1}
              value={sure}
              onChange={(e) => setSure(e.target.value)}
              className="w-full rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2.5 text-sm text-[#1a1612] outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#6b6158]">Mesafe (km)</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={mesafe}
              onChange={(e) => setMesafe(e.target.value)}
              className="w-full rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2.5 text-sm text-[#1a1612] outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#6b6158]">Enerji</label>
            <div className="flex gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEnerji(n)}
                  className="p-0.5"
                  aria-label={`${n}`}
                >
                  <Zap
                    className={`h-5 w-5 ${
                      n <= enerji ? "fill-amber-400 text-[#b8934a]" : "text-[#1a1612]/20"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        <input
          value={notlar}
          onChange={(e) => setNotlar(e.target.value)}
          placeholder="Not (opsiyonel)"
          className="w-full rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2.5 text-sm text-[#1a1612] outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          Kaydet
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Antrenman günü", value: String(monthStats.days) },
          { label: "En sık", value: monthStats.top },
          { label: "Toplam dakika", value: String(monthStats.totalMin) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 px-4 py-4"
          >
            <p className="text-[10px] uppercase tracking-wider text-[#1a1612]/40">
              {s.label}
            </p>
            <p className="mt-1 text-xl font-semibold text-[#1a1612]">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5">
        <h3 className="mb-3 text-sm text-[#6b6158]">Son 90 gün</h3>
        <div className="flex flex-wrap gap-1">
          {heatmap.map((c) => (
            <div
              key={c.iso}
              title={c.tip}
              className="h-3 w-3 rounded-sm"
              style={{
                background:
                  c.count === 0
                    ? "rgba(255,255,255,0.06)"
                    : c.count === 1
                      ? "rgba(184,147,74,0.45)"
                      : c.count === 2
                        ? "rgba(184,147,74,0.7)"
                        : "rgba(184,147,74,0.95)",
              }}
            />
          ))}
        </div>
      </section>

      <ul className="space-y-2">
        {items.slice(0, 15).map((i) => (
          <li
            key={i.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-4 py-3"
          >
            <div>
              <p className="text-sm text-[#1a1612]">
                {i.aktivite}
                {i.sure_dakika ? ` · ${i.sure_dakika} dk` : ""}
                {i.mesafe_km ? ` · ${i.mesafe_km} km` : ""}
              </p>
              <p className="text-[11px] text-[#1a1612]/40">{i.tarih}</p>
            </div>
            <button
              type="button"
              onClick={() => void remove(i.id)}
              className="text-[#1a1612]/40 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
