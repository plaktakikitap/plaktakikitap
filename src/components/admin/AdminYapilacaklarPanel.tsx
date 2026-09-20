"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import type { Oncelik, Yapilacak } from "@/types/kisisel";
import { showAdminToast } from "./admin-toast-events";

const COLUMNS: { id: Oncelik; label: string; accent: string }[] = [
  { id: "acil", label: "Acil", accent: "border-red-400/40 text-red-300" },
  { id: "normal", label: "Normal", accent: "border-amber-400/40 text-amber-300" },
  {
    id: "bekleyebilir",
    label: "Bekleyebilir",
    accent: "border-white/20 text-white/60",
  },
];

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
    if (!confirm("Bu görevi silmek istiyor musun?")) return;
    const res = await fetch(`/api/admin/yapilacaklar/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      showAdminToast("error", "Silinemedi.");
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
    showAdminToast("success", "Silindi ✓");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={addTask}
        className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center"
      >
        <input
          value={baslik}
          onChange={(e) => setBaslik(e.target.value)}
          placeholder="Görev başlığı yaz…"
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-amber-400/40"
          autoFocus
        />
        <select
          value={oncelik}
          onChange={(e) => setOncelik(e.target.value as Oncelik)}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="acil">Acil</option>
          <option value="normal">Normal</option>
          <option value="bekleyebilir">Bekleyebilir</option>
        </select>
        <input
          type="date"
          value={bitis}
          onChange={(e) => setBitis(e.target.value)}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
          title="Bitiş tarihi (opsiyonel)"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50"
        >
          Ekle
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <section
            key={col.id}
            className={`rounded-2xl border bg-white/[0.02] ${col.accent.split(" ")[0]}`}
          >
            <header className={`border-b border-white/10 px-4 py-3 text-sm font-medium ${col.accent}`}>
              {col.label}
              <span className="ml-2 text-xs font-normal text-white/35">
                {grouped[col.id].filter((x) => !x.tamamlandi).length}
              </span>
            </header>
            <ul className="space-y-2 p-3 min-h-[120px]">
              {grouped[col.id].length === 0 ? (
                <li className="px-1 py-4 text-center text-xs text-white/30">
                  Boş
                </li>
              ) : (
                grouped[col.id].map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"
                  >
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <input
                          value={editBaslik}
                          onChange={(e) => setEditBaslik(e.target.value)}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none"
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
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void saveEdit(item.id)}
                            className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs text-black"
                          >
                            Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg px-2 py-1 text-xs text-white/50"
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
                                ? "text-white/35 line-through"
                                : "text-white/90"
                            }`}
                          >
                            {item.baslik}
                          </button>
                          {item.bitis_tarihi ? (
                            <span className="mt-1 inline-block rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] text-sky-300">
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
                                  className="rounded px-1.5 py-0.5 text-[10px] text-white/30 hover:bg-white/10 hover:text-white/60"
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
                            className="rounded p-1 text-white/35 hover:text-white"
                            aria-label="Düzenle"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void remove(item.id)}
                            className="rounded p-1 text-white/35 hover:text-red-400"
                            aria-label="Sil"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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
