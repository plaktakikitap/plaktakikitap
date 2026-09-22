"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { GunlukKayit, RuhHali } from "@/types/takip";
import { showAdminToast } from "./admin-toast-events";

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const MOODS: { id: RuhHali; emoji: string; label: string }[] = [
  { id: "iyi", emoji: "😊", label: "İyi" },
  { id: "orta", emoji: "😐", label: "Orta" },
  { id: "zor", emoji: "😔", label: "Zor" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AdminGunlukPanel({
  initialItems,
}: {
  initialItems: GunlukKayit[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState(todayISO());
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [icerik, setIcerik] = useState("");
  const [ruh, setRuh] = useState<RuhHali | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GunlukKayit[] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipDebounce = useRef(false);

  const byDate = useMemo(() => {
    const m = new Map<string, GunlukKayit>();
    for (const i of items) m.set(i.tarih, i);
    return m;
  }, [items]);

  useEffect(() => {
    const entry = byDate.get(selected);
    skipDebounce.current = true;
    setIcerik(entry?.icerik ?? "");
    setRuh(entry?.ruh_hali ?? null);
  }, [selected, byDate]);

  useEffect(() => {
    if (skipDebounce.current) {
      skipDebounce.current = false;
      return;
    }
    if (!icerik.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void save(true);
    }, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [icerik, ruh]);

  async function save(silent = false) {
    if (!icerik.trim()) {
      if (!silent) showAdminToast("error", "İçerik boş olamaz.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/gunluk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tarih: selected,
          icerik,
          ruh_hali: ruh,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (!silent) showAdminToast("error", data.error || "Kaydedilemedi.");
        return;
      }
      setItems((prev) => {
        const rest = prev.filter((x) => x.tarih !== data.tarih);
        return [data, ...rest].sort((a, b) => b.tarih.localeCompare(a.tarih));
      });
      if (!silent) showAdminToast("success", "Kaydedildi ✓");
      router.refresh();
    } catch {
      if (!silent) showAdminToast("error", "Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  }

  async function doSearch(q: string) {
    setQuery(q);
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }
    const res = await fetch(`/api/admin/gunluk?q=${encodeURIComponent(q)}`);
    if (res.ok) setSearchResults(await res.json());
  }

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startPad = new Date(year, month, 1).getDay() - 1;
  if (startPad < 0) startPad = 6;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a1612]/40" />
          <input
            value={query}
            onChange={(e) => void doSearch(e.target.value)}
            placeholder="Ara…"
            className="w-full rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 py-2.5 pl-9 pr-3 text-sm text-[#1a1612] outline-none"
          />
        </div>

        {searchResults ? (
          <ul className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-[#e8e0d4] p-2">
            {searchResults.length === 0 ? (
              <li className="px-2 py-3 text-xs text-[#1a1612]/40">Sonuç yok</li>
            ) : (
              searchResults.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(r.tarih);
                      setSearchResults(null);
                      setQuery("");
                    }}
                    className="w-full rounded-lg px-2 py-2 text-left text-xs text-[#1a1612]/70 hover:bg-[#1a1612]/8"
                  >
                    <span className="text-[#1a1612]/40">{r.tarih}</span>
                    <span className="mt-0.5 block truncate">{r.icerik}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : (
          <div className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                className="rounded p-1 text-[#6b6158] hover:bg-[#1a1612]/8"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-[#1a1612]/70">
                {MONTHS[month]} {year}
              </span>
              <button
                type="button"
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                className="rounded p-1 text-[#6b6158] hover:bg-[#1a1612]/8"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: startPad }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1;
                const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const has = byDate.has(iso);
                const isSel = selected === iso;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelected(iso)}
                    className={`relative rounded-lg py-1.5 text-[11px] ${
                      isSel
                        ? "bg-amber-500/25 text-amber-200"
                        : "text-[#1a1612]/65 hover:bg-[#1a1612]/8"
                    }`}
                  >
                    {d}
                    {has ? (
                      <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-amber-400" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      <div className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#6b6158]">
            {new Date(selected + "T12:00:00").toLocaleDateString("tr-TR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {saving ? (
              <span className="ml-2 text-[11px] text-[#1a1612]/40">kaydediliyor…</span>
            ) : null}
          </p>
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setRuh(m.id)}
                className={`rounded-xl px-2.5 py-1.5 text-sm transition ${
                  ruh === m.id
                    ? "bg-[#1a1612]/8 ring-1 ring-amber-400/40"
                    : "bg-[#1a1612]/5 opacity-60 hover:opacity-100"
                }`}
                title={m.label}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={icerik}
          onChange={(e) => setIcerik(e.target.value)}
          placeholder="Bugün nasıl geçti…"
          className="min-h-[300px] w-full resize-y rounded-xl border border-[#e8e0d4] bg-transparent px-1 py-2 text-base leading-[1.8] text-[#1a1612] outline-none placeholder:text-[#6b6158]"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void save(false)}
            disabled={saving}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
