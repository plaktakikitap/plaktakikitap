"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { Not, NotRenk } from "@/types/kisisel";
import type { Yapilacak } from "@/types/kisisel";
import { showAdminToast } from "./admin-toast-events";
import {
  AdminFieldLabel,
  AdminSaveBar,
  AdminTextArea,
  AdminTextInput,
} from "./AdminFormPrimitives";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const RENK_OPTIONS: { id: NotRenk; label: string; swatch: string }[] = [
  { id: "sari", label: "Sarı", swatch: "#eab308" },
  { id: "mavi", label: "Mavi", swatch: "#3b82f6" },
  { id: "yesil", label: "Yeşil", swatch: "#22c55e" },
  { id: "kirmizi", label: "Kırmızı", swatch: "#ef4444" },
  { id: "mor", label: "Mor", swatch: "#a855f7" },
];

const RENK_BORDER: Record<NotRenk, string> = {
  sari: "border-l-amber-400",
  mavi: "border-l-blue-400",
  yesil: "border-l-emerald-400",
  kirmizi: "border-l-red-400",
  mor: "border-l-purple-400",
};

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function previewLine(text: string | null) {
  if (!text?.trim()) return "";
  return text.trim().split(/\n/)[0].slice(0, 80);
}

function formatShort(iso: string) {
  try {
    return new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString(
      "tr-TR",
      { day: "numeric", month: "short" }
    );
  } catch {
    return iso;
  }
}

export function AdminTakvimPanel({
  initialNotlar,
  initialYapilacaklar,
}: {
  initialNotlar: Not[];
  initialYapilacaklar: Yapilacak[];
}) {
  const router = useRouter();
  const [notlar, setNotlar] = useState(initialNotlar);
  const [todos, setTodos] = useState(initialYapilacaklar);
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(toISODate(new Date()));
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editing, setEditing] = useState<Not | null>(null);
  const [baslik, setBaslik] = useState("");
  const [icerik, setIcerik] = useState("");
  const [renk, setRenk] = useState<NotRenk>("sari");
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    // Monday-based: JS Sunday=0 → shift
    let startPad = first.getDay() - 1;
    if (startPad < 0) startPad = 6;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const notesByDate = useMemo(() => {
    const map = new Map<string, Not[]>();
    for (const n of notlar) {
      if (!n.tarih) continue;
      const list = map.get(n.tarih) ?? [];
      list.push(n);
      map.set(n.tarih, list);
    }
    return map;
  }, [notlar]);

  const todosByDate = useMemo(() => {
    const map = new Map<string, Yapilacak[]>();
    for (const t of todos) {
      if (!t.bitis_tarihi) continue;
      const list = map.get(t.bitis_tarihi) ?? [];
      list.push(t);
      map.set(t.bitis_tarihi, list);
    }
    return map;
  }, [todos]);

  const dayNotes = selected ? notesByDate.get(selected) ?? [] : [];
  const dayTodos = selected ? todosByDate.get(selected) ?? [] : [];

  function openNewNote(date?: string) {
    setEditing(null);
    setBaslik("");
    setIcerik("");
    setRenk("sari");
    if (date) setSelected(date);
    setShowNoteForm(true);
  }

  function openEdit(n: Not) {
    setEditing(n);
    setBaslik(n.baslik);
    setIcerik(n.icerik ?? "");
    setRenk(n.renk);
    if (n.tarih) setSelected(n.tarih);
    setShowNoteForm(true);
  }

  async function saveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!baslik.trim()) {
      showAdminToast("error", "Başlık zorunludur.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        baslik: baslik.trim(),
        icerik: icerik.trim() || null,
        renk,
        tarih: selected,
      };
      const res = await fetch(
        editing ? `/api/admin/notlar/${editing.id}` : "/api/admin/notlar",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error || "Kaydedilemedi.");
        return;
      }
      if (editing) {
        setNotlar((prev) => prev.map((n) => (n.id === data.id ? data : n)));
        showAdminToast("success", "Not güncellendi ✓");
      } else {
        setNotlar((prev) => [data, ...prev]);
        showAdminToast("success", "Not eklendi ✓");
      }
      setShowNoteForm(false);
      setEditing(null);
      router.refresh();
    } catch {
      showAdminToast("error", "Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  async function removeNote(id: string) {
    const res = await fetch(`/api/admin/notlar/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showAdminToast("error", "Silinemedi.");
      return;
    }
    setNotlar((prev) => prev.filter((n) => n.id !== id));
    setConfirmDeleteId(null);
    showAdminToast("success", "Silindi ✓");
    router.refresh();
  }

  const todayISO = toISODate(new Date());

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar */}
        <div className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="rounded-lg p-2 text-[#6b6158] hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
              aria-label="Önceki ay"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium text-[#1a1612]">
              {MONTHS[month]} {year}
            </h2>
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="rounded-lg p-2 text-[#6b6158] hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
              aria-label="Sonraki ay"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="py-1 text-center text-[10px] font-medium uppercase tracking-wider text-[#1a1612]/40"
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (d == null) {
                return <div key={`e-${i}`} className="aspect-square" />;
              }
              const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const nList = notesByDate.get(iso) ?? [];
              const tList = todosByDate.get(iso) ?? [];
              const isSel = selected === iso;
              const isToday = iso === todayISO;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setSelected(iso);
                    setShowNoteForm(false);
                  }}
                  className={`relative flex aspect-square flex-col items-start rounded-xl border p-1.5 text-left transition ${
                    isSel
                      ? "border-amber-400/50 bg-amber-500/15"
                      : "border-transparent bg-[#1a1612]/5 hover:bg-[#1a1612]/8"
                  } ${isToday && !isSel ? "ring-1 ring-[#b8934a]/40" : ""}`}
                >
                  <span
                    className={`text-xs ${
                      isSel ? "font-semibold text-amber-800" : "text-[#1a1612]/75"
                    }`}
                  >
                    {d}
                  </span>
                  <div className="mt-auto flex max-w-full flex-wrap gap-0.5">
                    {nList.slice(0, 2).map((n) => (
                      <span
                        key={n.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background:
                            RENK_OPTIONS.find((r) => r.id === n.renk)?.swatch ??
                            "#eab308",
                        }}
                        title={n.baslik}
                      />
                    ))}
                    {tList.slice(0, 2).map((t) => (
                      <span
                        key={t.id}
                        className="h-1.5 w-1.5 rounded-full bg-sky-400"
                        title={t.baslik}
                      />
                    ))}
                  </div>
                  {(nList[0] || tList[0]) && (
                    <span className="mt-0.5 hidden w-full truncate text-[9px] text-[#1a1612]/40 sm:block">
                      {nList[0]?.baslik ?? tList[0]?.baslik}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-[#1a1612]/40">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Not
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> Yapılacak
            </span>
          </div>
        </div>

        {/* Day panel */}
        <div className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#1a1612]/40">
                Seçili gün
              </p>
              <p className="text-sm font-medium text-[#1a1612]">
                {selected ? formatShort(selected) : "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openNewNote(selected ?? undefined)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-medium text-[#1a1612] hover:bg-amber-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Not ekle
            </button>
          </div>

          {showNoteForm ? (
            <form onSubmit={saveNote} className="mb-5 space-y-3 border-b border-[#e8e0d4] pb-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#6b6158]">
                  {editing ? "Notu düzenle" : "Yeni not"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowNoteForm(false);
                    setEditing(null);
                  }}
                  className="rounded p-1 text-[#1a1612]/40 hover:text-[#1a1612]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div>
                <AdminFieldLabel required>Başlık</AdminFieldLabel>
                <AdminTextInput
                  value={baslik}
                  onChange={(e) => setBaslik(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <AdminFieldLabel>İçerik</AdminFieldLabel>
                <AdminTextArea
                  value={icerik}
                  onChange={(e) => setIcerik(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <AdminFieldLabel>Renk</AdminFieldLabel>
                <div className="flex flex-wrap gap-2">
                  {RENK_OPTIONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRenk(r.id)}
                      className={`h-7 w-7 rounded-full border-2 transition ${
                        renk === r.id
                          ? "border-white scale-110"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      style={{ background: r.swatch }}
                      title={r.label}
                      aria-label={r.label}
                    />
                  ))}
                </div>
              </div>
              <AdminSaveBar loading={loading} />
            </form>
          ) : null}

          <div className="space-y-4">
            <section>
              <p className="mb-2 text-[10px] uppercase tracking-wider text-[#b8934a]/70">
                Notlar
              </p>
              {dayNotes.length === 0 ? (
                <p className="text-xs text-[#1a1612]/40">Bu güne not yok.</p>
              ) : (
                <ul className="space-y-2">
                  {dayNotes.map((n) => (
                    <li
                      key={n.id}
                      className={`rounded-lg border border-[#e8e0d4] border-l-4 bg-[#1a1612]/5 px-3 py-2 ${RENK_BORDER[n.renk]}`}
                    >
                      <p className="text-sm text-[#1a1612]">{n.baslik}</p>
                      {n.icerik ? (
                        <p className="mt-0.5 text-xs text-[#1a1612]/40 line-clamp-2">
                          {previewLine(n.icerik)}
                        </p>
                      ) : null}
                      <div className="mt-1.5 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(n)}
                          className="text-[#1a1612]/40 hover:text-[#1a1612]"
                          aria-label="Düzenle"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {confirmDeleteId === n.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => removeNote(n.id)}
                              className="text-[10px] font-medium text-red-500 hover:text-red-600"
                            >
                              Sil
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] text-[#6b6158] hover:text-[#1a1612]"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(n.id)}
                            className="text-[#1a1612]/40 hover:text-red-400"
                            aria-label="Sil"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <p className="mb-2 text-[10px] uppercase tracking-wider text-sky-400/70">
                Yapılacaklar
              </p>
              {dayTodos.length === 0 ? (
                <p className="text-xs text-[#1a1612]/40">Bu güne görev yok.</p>
              ) : (
                <ul className="space-y-1.5">
                  {dayTodos.map((t) => (
                    <li
                      key={t.id}
                      className={`rounded-lg border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-sm ${
                        t.tamamlandi
                          ? "text-[#1a1612]/40 line-through"
                          : "text-[#1a1612]/85"
                      }`}
                    >
                      {t.baslik}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* All notes list */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#1a1612]/70">Tüm notlar</h3>
          <button
            type="button"
            onClick={() => openNewNote()}
            className="text-xs text-[#b8934a]/80 hover:text-amber-300"
          >
            + Not (tarihsiz)
          </button>
        </div>
        {notlar.length === 0 ? (
          <p className="text-sm text-[#1a1612]/40">Henüz not yok.</p>
        ) : (
          <ul className="space-y-2">
            {notlar.map((n) => (
              <li
                key={n.id}
                className={`flex items-start justify-between gap-3 rounded-xl border border-[#e8e0d4] border-l-4 bg-[#1a1612]/5 px-4 py-3 ${RENK_BORDER[n.renk]}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1a1612]">
                    {n.baslik}
                  </p>
                  {n.icerik ? (
                    <p className="mt-0.5 truncate text-xs text-[#1a1612]/40">
                      {previewLine(n.icerik)}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {n.tarih ? (
                    <span className="text-[11px] text-[#1a1612]/40">
                      {formatShort(n.tarih)}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openEdit(n)}
                    className="rounded p-1.5 text-[#1a1612]/40 hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {confirmDeleteId === n.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-red-500">Emin misin?</span>
                      <button
                        type="button"
                        onClick={() => removeNote(n.id)}
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
                      onClick={() => setConfirmDeleteId(n.id)}
                      className="rounded p-1.5 text-[#1a1612]/40 hover:bg-red-500/20 hover:text-red-400"
                      aria-label="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
