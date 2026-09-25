"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Trash2 } from "lucide-react";
import type {
  BeslenmeAiAnaliz,
  BeslenmeKayit,
  BeslenmeOgun,
} from "@/types/takip";
import { showAdminToast } from "./admin-toast-events";

const OGUNLER: { id: BeslenmeOgun; label: string }[] = [
  { id: "sabah", label: "Sabah" },
  { id: "ogle", label: "Öğle" },
  { id: "aksam", label: "Akşam" },
  { id: "ara_ogun", label: "Ara öğün" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function MacroBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-[#6b6158]">
        <span>{label}</span>
        <span>{Math.round(value)}g</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#1a1612]/8">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function AdminBeslenmePanel({
  initialItems,
}: {
  initialItems: BeslenmeKayit[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [ogun, setOgun] = useState<BeslenmeOgun>("ogle");
  const [yenen, setYenen] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const today = todayISO();
  const todayItems = useMemo(
    () => items.filter((i) => i.tarih === today),
    [items, today]
  );

  const todayTotals = useMemo(() => {
    let kalori = 0;
    let protein = 0;
    let karb = 0;
    let yag = 0;
    const degerler: string[] = [];
    const eksikler = new Set<string>();
    for (const i of todayItems) {
      const a = i.ai_analiz;
      if (!a) continue;
      kalori += Number(a.tahmini_kalori) || 0;
      protein += Number(a.protein_g) || 0;
      karb += Number(a.karbonhidrat_g) || 0;
      yag += Number(a.yag_g) || 0;
      if (a.deger_lendirme) degerler.push(a.deger_lendirme);
      (a.eksik_besin ?? []).forEach((e) => eksikler.add(e));
    }
    return { kalori, protein, karb, yag, degerler, eksikler: [...eksikler] };
  }, [todayItems]);

  const weekChart = useMemo(() => {
    const days: { label: string; kalori: number; iso: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const kalori = items
        .filter((x) => x.tarih === iso)
        .reduce((s, x) => s + (Number(x.ai_analiz?.tahmini_kalori) || 0), 0);
      days.push({
        iso,
        label: d.toLocaleDateString("tr-TR", { weekday: "short" }),
        kalori: Math.round(kalori),
      });
    }
    return days;
  }, [items]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!yenen.trim()) {
      showAdminToast("error", "Ne yediğini yaz.");
      return;
    }
    setLoading(true);
    try {
      let ai_analiz: BeslenmeAiAnaliz | null = null;
      const analizRes = await fetch("/api/beslenme-analiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yemekler: yenen.trim() }),
      });
      const analizData = await analizRes.json();
      if (analizRes.ok && !analizData.error) {
        ai_analiz = analizData;
      } else {
        showAdminToast(
          "error",
          analizData.error || "Analiz başarısız — yine de kaydediliyor."
        );
      }

      const res = await fetch("/api/admin/beslenme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tarih: today,
          ogun,
          yenen: yenen.trim(),
          ai_analiz,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error || "Kaydedilemedi.");
        return;
      }
      setItems((prev) => [data, ...prev]);
      setYenen("");
      showAdminToast("success", "Kaydedildi ✓");
      router.refresh();
    } catch {
      showAdminToast("error", "Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/beslenme/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showAdminToast("error", "Silinemedi.");
      return;
    }
    setItems((prev) => prev.filter((k) => k.id !== id));
    setConfirmDeleteId(null);
    showAdminToast("success", "Silindi ✓");
  }

  return (
    <div className="space-y-8">
      <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700">
        Bu analizler yapay zeka tahminidir, kesin tıbbi bilgi değildir.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5"
        >
          <div className="flex flex-wrap gap-2">
            {OGUNLER.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setOgun(o.id)}
                className={`rounded-xl px-3 py-2 text-sm transition ${
                  ogun === o.id
                    ? "bg-amber-500 text-[#1a1612]"
                    : "bg-[#1a1612]/5 text-[#6b6158] hover:bg-[#1a1612]/8"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#1a1612]/70">
              Ne yedin?
            </label>
            <textarea
              value={yenen}
              onChange={(e) => setYenen(e.target.value)}
              rows={4}
              placeholder="yulaf ezmesi, 1 muz, fıstık ezmesi…"
              className="w-full rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3.5 py-2.5 text-sm text-[#1a1612] placeholder:text-[#6b6158] outline-none focus:border-[#b8934a]/40"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-[#1a1612] hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? "Analiz ediliyor…" : "Analiz Et & Kaydet"}
          </button>
        </form>

        <aside className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5">
          <p className="mb-3 text-[10px] uppercase tracking-wider text-[#1a1612]/40">
            Bugünün özeti
          </p>
          <p className="text-3xl font-semibold text-[#b8934a]">
            {Math.round(todayTotals.kalori)}
            <span className="ml-1 text-sm font-normal text-[#1a1612]/40">kcal</span>
          </p>
          <div className="mt-4 space-y-3">
            <MacroBar label="Protein" value={todayTotals.protein} max={120} color="#34d399" />
            <MacroBar label="Karbonhidrat" value={todayTotals.karb} max={250} color="#60a5fa" />
            <MacroBar label="Yağ" value={todayTotals.yag} max={80} color="#fbbf24" />
          </div>
          {todayTotals.degerler[0] ? (
            <p className="mt-4 text-xs leading-relaxed text-[#6b6158]">
              {todayTotals.degerler[0]}
            </p>
          ) : null}
          {todayTotals.eksikler.length > 0 ? (
            <p className="mt-2 text-xs text-red-500">
              Eksik: {todayTotals.eksikler.join(", ")}
            </p>
          ) : null}
        </aside>
      </div>

      <section className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5">
        <h3 className="mb-4 text-sm text-[#6b6158]">Son 7 gün — kalori</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekChart}>
              <XAxis dataKey="label" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} width={36} />
              <Tooltip
                contentStyle={{
                  background: "#1a1612",
                  border: "1px solid #333",
                  borderRadius: 8,
                  color: "#faf7f2",
                }}
              />
              <Bar dataKey="kalori" fill="#b8934a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm text-[#6b6158]">Bugünkü kayıtlar</h3>
        {todayItems.length === 0 ? (
          <p className="text-sm text-[#1a1612]/40">Henüz kayıt yok.</p>
        ) : (
          <ul className="space-y-2">
            {todayItems.map((i) => (
              <li
                key={i.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-xs text-[#b8934a]/80">
                    {OGUNLER.find((o) => o.id === i.ogun)?.label}
                    {i.ai_analiz?.tahmini_kalori != null
                      ? ` · ~${Math.round(Number(i.ai_analiz.tahmini_kalori))} kcal`
                      : ""}
                  </p>
                  <p className="mt-0.5 text-sm text-[#1a1612]/85">{i.yenen}</p>
                </div>
                {confirmDeleteId === i.id ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-xs text-red-500">Emin misin?</span>
                    <button
                      type="button"
                      onClick={() => void handleDelete(i.id)}
                      className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-[#faf7f2] hover:bg-red-600"
                    >
                      Sil
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-lg border border-[#e8e0d4] px-2.5 py-1 text-xs text-[#6b6158] hover:text-[#1a1612]"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(i.id)}
                    className="rounded-lg p-1.5 text-[#6b6158] hover:text-red-500"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
