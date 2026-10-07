"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Trash2 } from "lucide-react";
import type { VucutOlcum, VucutOlcumAlani } from "@/types/takip";
import {
  GRAFIK_ALANLARI,
  OLCUM_ALANLARI,
  vucutAnalizEt,
} from "@/lib/takip/vucut-analiz";
import { showAdminToast } from "./admin-toast-events";

function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function emptyValues(): Record<VucutOlcumAlani, string> {
  return Object.fromEntries(OLCUM_ALANLARI.map((field) => [field.key, ""])) as Record<
    VucutOlcumAlani,
    string
  >;
}

function valuesFrom(row: VucutOlcum | undefined): Record<VucutOlcumAlani, string> {
  const next = emptyValues();
  if (!row) return next;
  for (const field of OLCUM_ALANLARI) {
    const value = row[field.key];
    if (value != null) next[field.key] = String(value);
  }
  return next;
}

function formatTarih(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminVucutOlcumPanel({
  initialItems,
}: {
  initialItems: VucutOlcum[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [tarih, setTarih] = useState(todayISO);
  const [values, setValues] = useState<Record<VucutOlcumAlani, string>>(() =>
    valuesFrom(initialItems.find((row) => row.tarih === todayISO()))
  );
  const [notlar, setNotlar] = useState(
    () => initialItems.find((row) => row.tarih === todayISO())?.notlar ?? ""
  );
  const [grafik, setGrafik] = useState<VucutOlcumAlani>("kilo_kg");
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const kayitlar = useMemo(() => {
    const taslak = {
      id: "taslak",
      tarih,
      notlar: notlar.trim() || null,
      olusturma_tarihi: "",
    } as VucutOlcum;
    let dolu = false;
    for (const field of OLCUM_ALANLARI) {
      const raw = values[field.key].trim().replace(",", ".");
      if (!raw) {
        taslak[field.key] = null;
        continue;
      }
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        taslak[field.key] = null;
        continue;
      }
      taslak[field.key] = n;
      dolu = true;
    }
    if (!dolu) return items;
    return [taslak, ...items.filter((row) => row.tarih !== tarih)];
  }, [items, notlar, tarih, values]);

  const analiz = useMemo(() => vucutAnalizEt(kayitlar, grafik), [kayitlar, grafik]);
  const taslak = analiz.son?.id === "taslak";
  const grafikAlan = OLCUM_ALANLARI.find((field) => field.key === grafik);

  function loadDate(next: string, source = items) {
    const row = source.find((item) => item.tarih === next);
    setTarih(next);
    setValues(valuesFrom(row));
    setNotlar(row?.notlar ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const degerler = Object.fromEntries(
        OLCUM_ALANLARI.map((field) => [field.key, values[field.key]])
      );
      const res = await fetch("/api/admin/vucut-olcum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tarih, notlar, degerler }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error || "Kaydedilemedi.");
        return;
      }
      const saved = data as VucutOlcum;
      setItems((prev) =>
        [saved, ...prev.filter((row) => row.id !== saved.id && row.tarih !== saved.tarih)].sort(
          (a, b) => b.tarih.localeCompare(a.tarih)
        )
      );
      showAdminToast("success", "Ölçüm kaydedildi");
      router.refresh();
    } catch {
      showAdminToast("error", "Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/vucut-olcum/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showAdminToast("error", "Silinemedi.");
      return;
    }
    const next = items.filter((row) => row.id !== id);
    setItems(next);
    setConfirmDeleteId(null);
    if (!next.some((row) => row.tarih === tarih)) loadDate(tarih, next);
    showAdminToast("success", "Silindi");
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1a1612]">Vücut ölçüleri</h2>
        <p className="mt-1 text-sm text-[#6b6158]">
          Tartı ve mezura değerlerini tarihle kaydet. Aynı güne tekrar yazmak o günü günceller.
          Boyu bir kez girmen yeterli.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5"
        >
          <div>
            <label className="mb-1.5 block text-sm text-[#1a1612]/70">Tarih</label>
            <input
              type="date"
              value={tarih}
              onChange={(e) => loadDate(e.target.value)}
              required
              className="rounded-xl border border-[#e8e0d4] bg-white px-3.5 py-2.5 text-sm text-[#1a1612] outline-none focus:border-[#b8934a]/40"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {OLCUM_ALANLARI.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1 block text-xs text-[#6b6158]">
                  {field.label}
                  <span className="text-[#a09588]"> · {field.birim}</span>
                </span>
                <input
                  inputMode="decimal"
                  step={field.step}
                  value={values[field.key]}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-[#e8e0d4] bg-white px-3 py-2 text-sm text-[#1a1612] outline-none placeholder:text-[#c8bfb4] focus:border-[#b8934a]/40"
                />
              </label>
            ))}
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-[#6b6158]">Not</span>
            <input
              value={notlar}
              onChange={(e) => setNotlar(e.target.value)}
              placeholder="sabah aç karnına, antrenman sonrası…"
              className="w-full rounded-xl border border-[#e8e0d4] bg-white px-3 py-2 text-sm text-[#1a1612] outline-none placeholder:text-[#c8bfb4] focus:border-[#b8934a]/40"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-[#1a1612] hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? "Kaydediliyor…" : "Ölçümü kaydet"}
          </button>
        </form>

        <aside className="space-y-4 rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5">
          <p className="text-[10px] uppercase tracking-wider text-[#1a1612]/40">
            Otomatik okuma
          </p>
          {analiz.son ? (
            <p className="text-sm text-[#1a1612]">
              Son ölçüm {formatTarih(analiz.son.tarih)}
              {analiz.son.kilo_kg != null ? ` · ${analiz.son.kilo_kg} kg` : ""}
              {analiz.bmi ? ` · BKİ ${analiz.bmi.deger}` : ""}
            </p>
          ) : (
            <p className="text-sm text-[#6b6158]">Henüz ölçüm yok.</p>
          )}
          {analiz.farklar.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {analiz.farklar.map((fark) => (
                <li
                  key={fark.key}
                  className="rounded-full bg-white px-2.5 py-1 text-xs text-[#1a1612]"
                >
                  {fark.label} {fark.delta > 0 ? "+" : ""}
                  {fark.delta} {fark.birim}
                </li>
              ))}
            </ul>
          ) : null}
          <ul className="space-y-2 text-sm leading-relaxed text-[#6b6158]">
            {analiz.satirlar.map((satir) => (
              <li key={satir}>{satir}</li>
            ))}
          </ul>
          {analiz.oneriler.length > 0 ? (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#1a1612]/40">
                Öneriler
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[#1a1612]">
                {analiz.oneriler.map((oneri) => (
                  <li key={oneri}>{oneri}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {taslak ? (
            <p className="text-[11px] text-[#a09588]">
              Bu okuma formdaki taslaktan. Kaydedince geçmişe yazılır.
            </p>
          ) : null}
          <p className="text-[11px] text-[#a09588]">
            Okuma ve öneriler tartı farkından çıkar. Tıbbi değerlendirme değildir.
          </p>
        </aside>
      </div>

      <div className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {GRAFIK_ALANLARI.map((key) => {
            const field = OLCUM_ALANLARI.find((item) => item.key === key);
            if (!field) return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setGrafik(key)}
                className={`rounded-xl px-3 py-1.5 text-xs ${
                  grafik === key
                    ? "bg-[#1a1612] text-[#faf7f2]"
                    : "bg-white text-[#6b6158] hover:text-[#1a1612]"
                }`}
              >
                {field.label}
              </button>
            );
          })}
        </div>
        {analiz.seri.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#a09588]">
            Bu ölçü için henüz nokta yok.
          </p>
        ) : (
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analiz.seri}>
                <XAxis dataKey="label" stroke="#8a7e72" fontSize={11} />
                <YAxis
                  stroke="#8a7e72"
                  fontSize={11}
                  width={40}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={(value) => [
                    `${value} ${grafikAlan?.birim ?? ""}`,
                    grafikAlan?.label ?? "",
                  ]}
                  labelFormatter={(_label, payload) =>
                    payload?.[0]?.payload?.tarih
                      ? formatTarih(String(payload[0].payload.tarih))
                      : ""
                  }
                  contentStyle={{
                    background: "#1a1612",
                    border: "1px solid #333",
                    borderRadius: 8,
                    color: "#faf7f2",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="deger"
                  stroke="#b8934a"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#b8934a" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm text-[#6b6158]">Ölçüm geçmişi</h3>
        {items.length === 0 ? (
          <p className="text-sm text-[#1a1612]/40">Henüz kayıt yok.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((row) => {
              const ozet = OLCUM_ALANLARI.filter((field) => row[field.key] != null)
                .slice(0, 5)
                .map((field) => `${field.label} ${row[field.key]}${field.birim === "%" ? "%" : " " + field.birim}`)
                .join(" · ");
              return (
                <li
                  key={row.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[#e8e0d4] bg-white/70 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => loadDate(row.tarih)}
                    className="min-w-0 text-left"
                  >
                    <p className="text-sm font-medium text-[#1a1612]">
                      {formatTarih(row.tarih)}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6b6158]">{ozet || "Not kaydı"}</p>
                  </button>
                  {confirmDeleteId === row.id ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void handleDelete(row.id)}
                        className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-[#faf7f2]"
                      >
                        Sil
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-[#e8e0d4] px-2.5 py-1 text-xs text-[#6b6158]"
                      >
                        İptal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(row.id)}
                      className="rounded-lg p-1.5 text-[#6b6158] hover:text-red-500"
                      aria-label="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
