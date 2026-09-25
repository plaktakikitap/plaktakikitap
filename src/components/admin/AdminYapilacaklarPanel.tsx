"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import type { Oncelik, Yapilacak } from "@/types/kisisel";
import { showAdminToast } from "./admin-toast-events";

const COLUMNS: { id: Oncelik; label: string; accent: string; headerText: string }[] = [
  { id: "acil", label: "Acil", accent: "border-red-400/40", headerText: "text-red-500" },
  { id: "normal", label: "Normal", accent: "border-amber-400/40", headerText: "text-[#b8934a]" },
  { id: "bekleyebilir", label: "Bekleyebilir", accent: "border-[#d4c9bb]", headerText: "text-[#6b6158]" },
];

function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso + "T23:59:59") < new Date();
}

function formatShort(iso: string) {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

export function AdminYapilacaklarPanel({
  initialItems,
}: {
  initialItems: Yapilacak[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [baslik, setBaslik] = useState("");
  const [oncelik, setOncelik] = useState<Oncelik>("normal");
  const [bitis, setBitis] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBaslik, setEditBaslik] = useState("");
  const [editBitis, setEditBitis] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<Oncelik, Yapilacak[]> = {
      acil: [],
      normal: [],
      bekleyebilir: [],
    };
    for (const item of items) {
      map[item.oncelik].push(item);
    }
    for (const key of Object.keys(map) as Oncelik[]) {
      map[key].sort((a, b) => {
        if (a.tamamlandi !== b.tamamlandi) return a.tamamlandi ? 1 : -1;
        return (
          new Date(b.olusturma_tarihi).getTime() -
          new Date(a.olusturma_tarihi).getTime()
        );
      });
    }
    return map;
  }, [items]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!baslik.trim()) {
      showAdminToast("error", "Görev başlığı gerekli.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/yapilacaklar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baslik: baslik.trim(),
          oncelik,
          bitis_tarihi: bitis || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error || "Eklenemedi.");
        return;
      }
      setItems((prev) => [data, ...prev]);
      setBaslik("");
      setBitis("");
      setOncelik("normal");
      showAdminToast("success", "Görev eklendi ✓");
      router.refresh();
    } catch {
      showAdminToast("error", "Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleDone(item: Yapilacak) {
    const res = await fetch(`/api/admin/yapilacaklar/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tamamlandi: !item.tamamlandi }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAdminToast("error", data.error || "Güncellenemedi.");
      return;
    }
    setItems((prev) => prev.map((x) => (x.id === data.id ? data : x)));
    router.refresh();
  }

  async function changeOncelik(item: Yapilacak, next: Oncelik) {
    if (item.oncelik === next) return;
    const res = await fetch(`/api/admin/yapilacaklar/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oncelik: next }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAdminToast("error", data.error || "Güncellenemedi.");
      return;
    }
    setItems((prev) => prev.map((x) => (x.id === data.id ? data : x)));
    router.refresh();
  }

  function startEdit(item: Yapilacak) {
    setEditingId(item.id);
    setEditBaslik(item.baslik);
    setEditBitis(item.bitis_tarihi ?? "");
  }

  async function saveEdit(id: string) {
    if (!editBaslik.trim()) {
      showAdminToast("error", "Başlık boş olamaz.");
      return;
    }
    const res = await fetch(`/api/admin/yapilacaklar/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baslik: editBaslik.trim(),
        bitis_tarihi: editBitis || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAdminToast("error", data.error || "Güncellenemedi.");
      return;
    }
    setItems((prev) => prev.map((x) => (x.id === data.id ? data : x)));
    setEditingId(null);
    showAdminToast("success", "Güncellendi ✓");
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/yapilacaklar/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showAdminToast("error", "Silinemedi.");
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
    setConfirmDeleteId(null);
    showAdminToast("success", "Silindi ✓");
    router.refresh();
  }

  async function clearDone(oncelik: Oncelik) {
    const doneIds = grouped[oncelik]
      .filter((x) => x.tamamlandi)
      .map((x) => x.id);
    await Promise.all(
      doneIds.map((id) =>
        fetch(`/api/admin/yapilacaklar/${id}`, { method: "DELETE" })
      )
    );
    setItems((prev) => prev.filter((x) => !(x.oncelik === oncelik && x.tamamlandi)));
    showAdminToast("success", `${doneIds.length} görev silindi ✓`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={addTask}
        className="sticky top-14 z-10 flex flex-col gap-2 rounded-2xl border border-[#e8e0d4] bg-[#faf7f2]/95 p-3 backdrop-blur-sm sm:flex-row sm:items-center lg:top-0"
      >
        <input
          value={baslik}
          onChange={(e) => setBaslik(e.target.value)}
          placeholder="Görev başlığı yaz…"
          className="min-w-0 flex-1 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3.5 py-2.5 text-sm text-[#1a1612] placeholder:text-[#6b6158] outline-none focus:border-[#b8934a]/40"
          autoFocus
        />
        <select
          value={oncelik}
          onChange={(e) => setOncelik(e.target.value as Oncelik)}
          className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2.5 text-sm text-[#1a1612] outline-none"
        >
          <option value="acil">Acil</option>
          <option value="normal">Normal</option>
          <option value="bekleyebilir">Bekleyebilir</option>
        </select>
        <div className="relative mb-3 sm:mb-0">
          <input
            type="date"
            value={bitis}
            onChange={(e) => setBitis(e.target.value)}
            className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2.5 text-sm text-[#1a1612] outline-none"
            title="Bitiş tarihi"
          />
          {bitis && (
            <p className="absolute -bottom-4 left-0 text-[10px] text-[#a09588]">
              Takvimde görünür
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-[#1a1612] hover:bg-amber-400 disabled:opacity-50"
        >
          Ekle
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <section
            key={col.id}
            className={`rounded-2xl border bg-[#1a1612]/5 ${col.accent}`}
          >
            <header className={`flex items-center justify-between border-b border-[#e8e0d4] px-4 py-3 text-sm font-medium ${col.headerText}`}>
              <span>
                {col.label}
                <span className="ml-2 text-xs font-normal text-[#1a1612]/40">
                  {grouped[col.id].filter((x) => !x.tamamlandi).length}
                </span>
              </span>
              {grouped[col.id].some((x) => x.tamamlandi) && (
                <button
                  type="button"
                  onClick={() => void clearDone(col.id)}
                  className="text-[10px] text-[#a09588] hover:text-red-400 transition-colors"
                >
                  Tamamlananları sil
                </button>
              )}
            </header>
            <ul className="space-y-2 p-3 min-h-[120px]">
              {grouped[col.id].length === 0 ? (
                <li className="px-1 py-4 text-center text-xs text-[#6b6158]">
                  Boş
                </li>
              ) : (
                grouped[col.id].map((item) => (
                  <li
                    key={item.id}
                    className={`rounded-xl border border-[#e8e0d4] px-3 py-2.5 transition-all ${
                      item.tamamlandi
                        ? "bg-[#f0ebe2]/50 opacity-60"
                        : "bg-[#f0ebe2]"
                    }`}
                  >
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <input
                          value={editBaslik}
                          onChange={(e) => setEditBaslik(e.target.value)}
                          className="w-full rounded-lg border border-[#e8e0d4] bg-[#1a1612]/5 px-2.5 py-1.5 text-sm text-[#1a1612] outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void saveEdit(item.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <input
                          type="date"
                          value={editBitis}
                          onChange={(e) => setEditBitis(e.target.value)}
                          className="w-full rounded-lg border border-[#e8e0d4] bg-[#1a1612]/5 px-2.5 py-1.5 text-sm text-[#1a1612] outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void saveEdit(item.id)}
                            className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs text-[#1a1612]"
                          >
                            Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg px-2 py-1 text-xs text-[#6b6158]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={item.tamamlandi}
                          onChange={() => void toggleDone(item)}
                          className="mt-1 accent-amber-500"
                        />
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className={`block w-full text-left text-sm ${
                              item.tamamlandi
                                ? "text-[#1a1612]/40 line-through"
                                : "text-[#1a1612]"
                            }`}
                          >
                            {item.baslik}
                          </button>
                          {item.bitis_tarihi ? (
                            <span
                              className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] ${
                                isOverdue(item.bitis_tarihi) && !item.tamamlandi
                                  ? "bg-red-500/15 text-red-500"
                                  : "bg-sky-500/15 text-sky-600"
                              }`}
                            >
                              {isOverdue(item.bitis_tarihi) && !item.tamamlandi ? "⚠ " : ""}
                              {formatShort(item.bitis_tarihi)}
                            </span>
                          ) : null}
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {COLUMNS.filter((c) => c.id !== item.oncelik).map(
                              (c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => void changeOncelik(item, c.id)}
                                  className="rounded px-1.5 py-0.5 text-[10px] text-[#6b6158] hover:bg-[#1a1612]/8 hover:text-[#6b6158]"
                                  title={`${c.label}e taşı`}
                                >
                                  → {c.label}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="rounded p-1 text-[#1a1612]/40 hover:text-[#1a1612]"
                            aria-label="Düzenle"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {confirmDeleteId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => void remove(item.id)}
                                className="rounded px-1.5 py-0.5 text-[10px] font-medium text-red-500 hover:text-red-600"
                              >
                                Sil
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded px-1.5 py-0.5 text-[10px] text-[#6b6158]"
                              >
                                İptal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="rounded p-1 text-[#1a1612]/40 hover:text-red-400"
                              aria-label="Sil"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
