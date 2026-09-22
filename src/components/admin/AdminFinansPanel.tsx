"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Settings2, Trash2 } from "lucide-react";
import type { FinansKategori, FinansKayit, FinansTur } from "@/types/takip";
import { showAdminToast } from "./admin-toast-events";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function monthBounds(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const last = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { from, to };
}

function formatTL(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

export function AdminFinansPanel({
  initialKayitlar,
  initialKategoriler,
}: {
  initialKayitlar: FinansKayit[];
  initialKategoriler: FinansKategori[];
}) {
  const router = useRouter();
  const [kayitlar, setKayitlar] = useState(initialKayitlar);
  const [kategoriler, setKategoriler] = useState(initialKategoriler);
  const [tur, setTur] = useState<FinansTur>("gider");
  const [tutar, setTutar] = useState("");
  const [kategori, setKategori] = useState("");
  const [tarih, setTarih] = useState(todayISO());
  const [notlar, setNotlar] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCats, setShowCats] = useState(false);
  const [newCatAd, setNewCatAd] = useState("");
  const [newCatTur, setNewCatTur] = useState<FinansTur>("gider");
  const [newCatRenk, setNewCatRenk] = useState("#c9a65a");

  const now = new Date();
  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  const monthOptions = useMemo(() => {
    const opts: string[] = [];
    for (let i = 0; i < 18; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      opts.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      );
    }
    return opts;
  }, [now]);

  const filteredCats = kategoriler.filter((k) => k.tur === tur);

  const monthKayitlar = useMemo(() => {
    const { from, to } = monthBounds(month);
    return kayitlar.filter((k) => k.tarih >= from && k.tarih <= to);
  }, [kayitlar, month]);

  const summary = useMemo(() => {
    let gelir = 0;
    let gider = 0;
    const byCat = new Map<string, number>();
    for (const k of monthKayitlar) {
      if (k.tur === "gelir") gelir += k.tutar;
      else {
        gider += k.tutar;
        byCat.set(k.kategori, (byCat.get(k.kategori) ?? 0) + k.tutar);
      }
    }
    const pie = [...byCat.entries()].map(([name, value]) => ({
      name,
      value,
      color:
        kategoriler.find((c) => c.ad === name)?.renk ?? "#c9a65a",
    }));
    return { gelir, gider, net: gelir - gider, pie };
  }, [monthKayitlar, kategoriler]);

  async function addKayit(e: React.FormEvent) {
    e.preventDefault();
    const kat = kategori || filteredCats[0]?.ad;
    if (!kat) {
      showAdminToast("error", "Önce kategori ekle.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/finans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tur,
          tutar: Number(tutar),
          kategori: kat,
          tarih,
          notlar: notlar.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error || "Kaydedilemedi.");
        return;
      }
      setKayitlar((prev) => [data, ...prev]);
      setTutar("");
      setNotlar("");
      showAdminToast("success", "Kaydedildi ✓");
      router.refresh();
    } catch {
      showAdminToast("error", "Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Silinsin mi?")) return;
    const res = await fetch(`/api/admin/finans/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showAdminToast("error", "Silinemedi.");
      return;
    }
    setKayitlar((prev) => prev.filter((x) => x.id !== id));
  }

  async function addCat(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/finans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-kategori",
        ad: newCatAd,
        tur: newCatTur,
        renk: newCatRenk,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAdminToast("error", data.error || "Eklenemedi.");
      return;
    }
    setKategoriler((prev) => [...prev, data]);
    setNewCatAd("");
    showAdminToast("success", "Kategori eklendi ✓");
  }

  async function delCat(id: string) {
    if (!confirm("Kategori silinsin mi?")) return;
    const res = await fetch("/api/admin/finans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-kategori", id }),
    });
    if (!res.ok) {
      showAdminToast("error", "Silinemedi.");
      return;
    }
    setKategoriler((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2 text-sm text-[#1a1612] outline-none"
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowCats((o) => !o)}
          className="inline-flex items-center gap-1.5 text-xs text-[#6b6158] hover:text-[#1a1612]/80"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Kategorileri düzenle
        </button>
      </div>

      {showCats ? (
        <div className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-4">
          <form onSubmit={addCat} className="mb-4 flex flex-wrap gap-2">
            <input
              value={newCatAd}
              onChange={(e) => setNewCatAd(e.target.value)}
              placeholder="Yeni kategori"
              className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2 text-sm text-[#1a1612] outline-none"
              required
            />
            <select
              value={newCatTur}
              onChange={(e) => setNewCatTur(e.target.value as FinansTur)}
              className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2 text-sm text-[#1a1612]"
            >
              <option value="gider">Gider</option>
              <option value="gelir">Gelir</option>
            </select>
            <input
              type="color"
              value={newCatRenk}
              onChange={(e) => setNewCatRenk(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent"
            />
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-3 py-2 text-sm text-black"
            >
              Ekle
            </button>
          </form>
          <ul className="flex flex-wrap gap-2">
            {kategoriler.map((c) => (
              <li
                key={c.id}
                className="inline-flex items-center gap-2 rounded-full border border-[#e8e0d4] px-3 py-1 text-xs text-[#1a1612]/70"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: c.renk }}
                />
                {c.ad}
                <span className="text-[#6b6158]">{c.tur}</span>
                <button
                  type="button"
                  onClick={() => void delCat(c.id)}
                  className="text-[#6b6158] hover:text-red-400"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form
        onSubmit={addKayit}
        className="space-y-4 rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5"
      >
        <div className="grid grid-cols-2 gap-2">
          {(["gider", "gelir"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTur(t);
                setKategori("");
              }}
              className={`rounded-xl py-3 text-sm font-medium transition ${
                tur === t
                  ? t === "gelir"
                    ? "bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-400/40"
                    : "bg-red-500/25 text-red-300 ring-1 ring-red-400/40"
                  : "bg-[#1a1612]/5 text-[#1a1612]/40"
              }`}
            >
              {t === "gelir" ? "Gelir" : "Gider"}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            min={0}
            step={0.01}
            value={tutar}
            onChange={(e) => setTutar(e.target.value)}
            placeholder="Tutar (₺)"
            required
            className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3.5 py-2.5 text-sm text-[#1a1612] outline-none"
          />
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2.5 text-sm text-[#1a1612] outline-none"
          >
            <option value="">Kategori seç</option>
            {filteredCats.map((c) => (
              <option key={c.id} value={c.ad}>
                {c.ad}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={tarih}
            onChange={(e) => setTarih(e.target.value)}
            className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2.5 text-sm text-[#1a1612] outline-none"
          />
          <input
            value={notlar}
            onChange={(e) => setNotlar(e.target.value)}
            placeholder="Not (opsiyonel)"
            className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2.5 text-sm text-[#1a1612] outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          Kaydet
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
          <p className="text-[10px] uppercase text-emerald-400/70">Gelir</p>
          <p className="mt-1 text-xl font-semibold text-emerald-300">
            {formatTL(summary.gelir)}
          </p>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4">
          <p className="text-[10px] uppercase text-red-400/70">Gider</p>
          <p className="mt-1 text-xl font-semibold text-red-300">
            {formatTL(summary.gider)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 px-4 py-4">
          <p className="text-[10px] uppercase text-[#1a1612]/40">Net</p>
          <p
            className={`mt-1 text-xl font-semibold ${
              summary.net >= 0 ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {formatTL(summary.net)}
          </p>
        </div>
      </div>

      {summary.pie.length > 0 ? (
        <section className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5">
          <h3 className="mb-3 text-sm text-[#6b6158]">Gider dağılımı</h3>
          <div className="mx-auto h-56 w-full max-w-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.pie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {summary.pie.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatTL(Number(v))}
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: 8,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="mb-3 text-sm text-[#6b6158]">Son işlemler</h3>
        <ul className="space-y-2">
          {monthKayitlar.slice(0, 20).map((k) => (
            <li
              key={k.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-[#1a1612]/85">
                  <span
                    className={
                      k.tur === "gelir" ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {k.tur === "gelir" ? "+" : "−"}
                    {formatTL(k.tutar)}
                  </span>
                  <span className="ml-2 text-[#1a1612]/40">{k.kategori}</span>
                </p>
                <p className="text-[11px] text-[#1a1612]/40">
                  {k.tarih}
                  {k.notlar ? ` · ${k.notlar}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void remove(k.id)}
                className="text-[#1a1612]/40 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
