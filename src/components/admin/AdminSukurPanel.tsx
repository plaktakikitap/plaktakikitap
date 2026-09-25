"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SukurKayit } from "@/types/takip";
import { showAdminToast } from "./admin-toast-events";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function AdminSukurPanel({
  initialItems,
}: {
  initialItems: SukurKayit[];
}) {
  const router = useRouter();
  const today = todayISO();
  const [items, setItems] = useState(initialItems);
  const todayEntry = items.find((i) => i.tarih === today) ?? null;
  const [editing, setEditing] = useState(!todayEntry);
  const [m1, setM1] = useState(todayEntry?.madde_1 ?? "");
  const [m2, setM2] = useState(todayEntry?.madde_2 ?? "");
  const [m3, setM3] = useState(todayEntry?.madde_3 ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!m1.trim() || !m2.trim() || !m3.trim()) {
      showAdminToast("error", "Üç madde de zorunlu.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sukur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tarih: today,
          madde_1: m1,
          madde_2: m2,
          madde_3: m3,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error || "Kaydedilemedi.");
        return;
      }
      setItems((prev) => {
        const rest = prev.filter((x) => x.tarih !== today);
        return [data, ...rest];
      });
      setEditing(false);
      showAdminToast("success", "Kaydedildi ✓");
      router.refresh();
    } catch {
      showAdminToast("error", "Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-10">
      <section className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-medium text-[#1a1612]">
          Bugün ne için şükrediyorsun?
        </h2>
        <p className="mb-5 text-xs text-[#1a1612]/40">{formatDate(today)}</p>

        {!editing && todayEntry ? (
          <div>
            <p className="mb-4 text-sm text-emerald-600">Bugün zaten yazdın ✓</p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-[#1a1612]/85">
              <li>{todayEntry.madde_1}</li>
              <li>{todayEntry.madde_2}</li>
              <li>{todayEntry.madde_3}</li>
            </ol>
            <button
              type="button"
              onClick={() => {
                setM1(todayEntry.madde_1);
                setM2(todayEntry.madde_2);
                setM3(todayEntry.madde_3);
                setEditing(true);
              }}
              className="mt-5 text-sm text-[#6b6158] hover:text-[#b8934a]"
            >
              Düzenle
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-4 text-sm text-[#1a1612]/40">1.</span>
              <input
                value={m1}
                onChange={(e) => setM1(e.target.value)}
                required
                className="flex-1 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3.5 py-2.5 text-sm text-[#1a1612] outline-none focus:border-[#b8934a]/40"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 text-sm text-[#1a1612]/40">2.</span>
              <input
                value={m2}
                onChange={(e) => setM2(e.target.value)}
                required
                className="flex-1 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3.5 py-2.5 text-sm text-[#1a1612] outline-none focus:border-[#b8934a]/40"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 text-sm text-[#1a1612]/40">3.</span>
              <input
                value={m3}
                onChange={(e) => setM3(e.target.value)}
                required
                className="flex-1 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3.5 py-2.5 text-sm text-[#1a1612] outline-none focus:border-[#b8934a]/40"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-[#1a1612] hover:bg-amber-400 disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          </form>
        )}
      </section>

      <section>
        <h3 className="mb-4 text-sm text-[#6b6158]">Geçmiş</h3>
        <ul className="space-y-4">
          {items
            .filter((i) => i.tarih !== today || !editing)
            .map((i) => (
              <li
                key={i.id}
                className="rounded-2xl border border-[#e8e0d4] bg-gradient-to-br from-amber-500/5 to-transparent px-5 py-4"
              >
                <p className="mb-3 text-[11px] uppercase tracking-wider text-[#1a1612]/40">
                  {formatDate(i.tarih)}
                </p>
                <ul className="space-y-1.5 text-sm text-[#1a1612]/80">
                  <li>· {i.madde_1}</li>
                  <li>· {i.madde_2}</li>
                  <li>· {i.madde_3}</li>
                </ul>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
