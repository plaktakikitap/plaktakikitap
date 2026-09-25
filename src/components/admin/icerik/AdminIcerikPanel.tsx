"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  CalendarDays,
  ChevronRight,
  LayoutGrid,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  IC_DURUM_LABEL,
  IC_DURUMLAR,
  IC_PLATFORM_LABEL,
  IC_TUR_LABEL,
  type IcDurum,
  type IcHesap,
  type IcIcerikWithHesap,
  type IcPlatform,
  type IcTur,
} from "@/types/icerik";
import { IcerikPushSetup } from "./IcerikPushSetup";
import {
  AdminFieldLabel,
  AdminTextArea,
  AdminTextInput,
} from "@/components/admin/AdminFormPrimitives";
import { showAdminToast } from "@/components/admin/admin-toast-events";

type Tab = "pano" | "takvim" | "hesaplar" | "ayarlar";

const TUR_COLORS: Record<IcTur, string> = {
  post: "bg-amber-500/15 text-amber-700 border-amber-500/25",
  story: "bg-sky-500/15 text-sky-600 border-sky-500/25",
  video: "bg-violet-500/15 text-violet-600 border-violet-500/25",
  reel: "bg-rose-500/15 text-rose-600 border-rose-500/25",
};

const PLATFORM_ICON: Record<IcPlatform, string> = {
  instagram: "📷",
  tiktok: "🎵",
  youtube: "▶️",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try {
    return new Date(d + "T12:00:00").toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return d;
  }
}

type ModalState =
  | { mode: "closed" }
  | {
      mode: "create" | "edit";
      durum?: IcDurum;
      planlanan?: string | null;
      item?: IcIcerikWithHesap;
    };

export function AdminIcerikPanel({
  initialHesaplar,
  initialIcerikler,
}: {
  initialHesaplar: IcHesap[];
  initialIcerikler: IcIcerikWithHesap[];
}) {
  const [tab, setTab] = useState<Tab>("pano");
  const [hesaplar, setHesaplar] = useState(initialHesaplar);
  const [icerikler, setIcerikler] = useState(initialIcerikler);
  const [hesapFilter, setHesapFilter] = useState<string | "all">("all");
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });

  const refresh = useCallback(async () => {
    const [hRes, iRes] = await Promise.all([
      fetch("/api/admin/icerik/hesaplar?all=1"),
      fetch("/api/admin/icerik/icerikler"),
    ]);
    if (hRes.ok) setHesaplar(await hRes.json());
    if (iRes.ok) setIcerikler(await iRes.json());
  }, []);

  const filtered = useMemo(() => {
    if (hesapFilter === "all") return icerikler;
    return icerikler.filter((i) => i.hesap_id === hesapFilter);
  }, [icerikler, hesapFilter]);

  const byDurum = useMemo(() => {
    const map: Record<IcDurum, IcIcerikWithHesap[]> = {
      fikir: [],
      yazildi: [],
      hazir: [],
      paylasildi: [],
    };
    for (const item of filtered) {
      map[item.durum]?.push(item);
    }
    return map;
  }, [filtered]);

  async function advance(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/icerik/icerikler", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, advance: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İlerletilemedi");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/admin/icerik/icerikler", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      showAdminToast("error", "Silinemedi.");
      return;
    }
    setIcerikler((prev) => prev.filter((i) => i.id !== id));
    setConfirmDeleteId(null);
    showAdminToast("success", "Silindi ✓");
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
    { id: "pano", label: "Pano", icon: LayoutGrid },
    { id: "takvim", label: "Takvim", icon: CalendarDays },
    { id: "hesaplar", label: "Hesaplar", icon: Users },
    { id: "ayarlar", label: "Ayarlar", icon: Settings2 },
  ];

  return (
    <div>
      <IcerikPushSetup />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-[#e8e0d4] pb-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-amber-400/15 text-amber-200"
                  : "text-[#6b6158] hover:bg-[#1a1612]/5 hover:text-[#1a1612]/80"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      {tab === "pano" ? (
        <PanoTab
          hesaplar={hesaplar.filter((h) => h.aktif)}
          hesapFilter={hesapFilter}
          setHesapFilter={setHesapFilter}
          byDurum={byDurum}
          busy={busy}
          onCreate={(durum) =>
            setModal({ mode: "create", durum, planlanan: null })
          }
          onEdit={(item) => setModal({ mode: "edit", item })}
          onAdvance={advance}
          onDelete={handleDelete}
          confirmDeleteId={confirmDeleteId}
          setConfirmDeleteId={setConfirmDeleteId}
        />
      ) : null}

      {tab === "takvim" ? (
        <TakvimTab
          hesaplar={hesaplar}
          icerikler={filtered}
          hesapFilter={hesapFilter}
          setHesapFilter={setHesapFilter}
          month={calMonth}
          setMonth={setCalMonth}
          onDayClick={(date) =>
            setModal({ mode: "create", durum: "fikir", planlanan: date })
          }
          onItemClick={(item) => setModal({ mode: "edit", item })}
        />
      ) : null}

      {tab === "hesaplar" ? (
        <HesaplarTab hesaplar={hesaplar} icerikler={icerikler} onRefresh={refresh} />
      ) : null}

      {tab === "ayarlar" ? (
        <AyarlarTab hesaplar={hesaplar} icerikler={icerikler} onRefresh={refresh} />
      ) : null}

      {modal.mode !== "closed" ? (
        <IcerikModal
          mode={modal.mode}
          hesaplar={hesaplar.filter((h) => h.aktif)}
          initialDurum={modal.mode === "create" ? modal.durum : undefined}
          initialPlanlanan={
            modal.mode === "create" ? modal.planlanan : undefined
          }
          item={modal.mode === "edit" ? modal.item : undefined}
          busy={busy}
          onClose={() => setModal({ mode: "closed" })}
          onSaved={async () => {
            setModal({ mode: "closed" });
            await refresh();
          }}
          setBusy={setBusy}
          setError={setError}
        />
      ) : null}
    </div>
  );
}

function HesapChips({
  hesaplar,
  hesapFilter,
  setHesapFilter,
}: {
  hesaplar: IcHesap[];
  hesapFilter: string | "all";
  setHesapFilter: (v: string | "all") => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setHesapFilter("all")}
        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
          hesapFilter === "all"
            ? "bg-[#1a1612]/8 text-[#1a1612]"
            : "bg-[#1a1612]/5 text-[#6b6158] hover:bg-[#1a1612]/8"
        }`}
      >
        Tümü
      </button>
      {hesaplar.map((h) => (
        <button
          key={h.id}
          type="button"
          onClick={() => setHesapFilter(h.id)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            hesapFilter === h.id ? "text-black" : "text-[#1a1612]/80 hover:opacity-90"
          }`}
          style={{
            background:
              hesapFilter === h.id ? h.renk : `${h.renk}33`,
            border: `1px solid ${h.renk}55`,
          }}
        >
          {h.ad}
        </button>
      ))}
    </div>
  );
}

function PanoTab({
  hesaplar,
  hesapFilter,
  setHesapFilter,
  byDurum,
  busy,
  onCreate,
  onEdit,
  onAdvance,
  onDelete,
  confirmDeleteId,
  setConfirmDeleteId,
}: {
  hesaplar: IcHesap[];
  hesapFilter: string | "all";
  setHesapFilter: (v: string | "all") => void;
  byDurum: Record<IcDurum, IcIcerikWithHesap[]>;
  busy: boolean;
  onCreate: (durum: IcDurum) => void;
  onEdit: (item: IcIcerikWithHesap) => void;
  onAdvance: (id: string) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
}) {
  return (
    <div>
      <HesapChips
        hesaplar={hesaplar}
        hesapFilter={hesapFilter}
        setHesapFilter={setHesapFilter}
      />
      <div className="grid gap-3 lg:grid-cols-4">
        {IC_DURUMLAR.map((durum) => (
          <div
            key={durum}
            className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b6158]">
                {IC_DURUM_LABEL[durum]}
                <span className="ml-1.5 text-[#6b6158]">
                  {byDurum[durum].length}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => onCreate(durum)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-amber-300/80 hover:bg-amber-400/10"
              >
                <Plus className="h-3 w-3" /> Yeni
              </button>
            </div>
            <div className="space-y-2">
              {byDurum[durum].map((item) => (
                <IcerikKart
                  key={item.id}
                  item={item}
                  busy={busy}
                  confirmDeleteId={confirmDeleteId}
                  onEdit={() => onEdit(item)}
                  onAdvance={() => onAdvance(item.id)}
                  onAskDelete={() => setConfirmDeleteId(item.id)}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  onDelete={() => onDelete(item.id)}
                />
              ))}
              {byDurum[durum].length === 0 ? (
                <p className="py-6 text-center text-[11px] text-[#1a1612]/25">Boş</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IcerikKart({
  item,
  busy,
  confirmDeleteId,
  onEdit,
  onAdvance,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  item: IcIcerikWithHesap;
  busy: boolean;
  confirmDeleteId: string | null;
  onEdit: () => void;
  onAdvance: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const renk = item.hesap?.renk ?? "#c9a65a";
  const canAdvance = item.durum !== "paylasildi";
  return (
    <article
      className="relative overflow-hidden rounded-lg border border-[#e8e0d4] bg-[#1a1612]/5 p-3 pl-3.5"
      style={{ boxShadow: `inset 4px 0 0 ${renk}` }}
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${TUR_COLORS[item.tur] ?? "bg-[#1a1612]/8 text-[#6b6158]"}`}
        >
          {IC_TUR_LABEL[item.tur]}
        </span>
        <span className="text-[11px]" title={IC_PLATFORM_LABEL[item.platform]}>
          {PLATFORM_ICON[item.platform]}
        </span>
        <span className="text-[10px] text-[#1a1612]/40">{item.hesap?.ad}</span>
      </div>
      <h4 className="text-sm font-medium leading-snug text-[#1a1612]">
        {item.baslik}
      </h4>
      {item.planlanan_tarih ? (
        <p className="mt-1.5 text-[11px] text-[#1a1612]/40">
          📅 {formatDate(item.planlanan_tarih)}
        </p>
      ) : null}
      {item.durum === "paylasildi" && item.paylasim_tarihi ? (
        <p className="mt-1 text-[11px] text-emerald-300/70">
          Paylaşıldı: {formatDate(item.paylasim_tarihi)}
        </p>
      ) : null}
      <div className="mt-2.5 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] text-[#6b6158] hover:bg-[#1a1612]/5 hover:text-[#1a1612]/80"
        >
          <Pencil className="h-3 w-3" /> Düzenle
        </button>
        {confirmDeleteId === item.id ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-red-500">Emin misin?</span>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-[#faf7f2] hover:bg-red-600"
            >
              Sil
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              className="rounded-lg border border-[#e8e0d4] px-2.5 py-1 text-xs text-[#6b6158] hover:text-[#1a1612]"
            >
              İptal
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAskDelete}
            disabled={busy}
            className="rounded-lg p-1.5 text-[#6b6158] hover:text-red-500"
            aria-label="Sil"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        {canAdvance ? (
          <button
            type="button"
            onClick={onAdvance}
            disabled={busy}
            className="ml-auto inline-flex items-center gap-0.5 rounded bg-amber-400/10 px-2 py-1 text-[10px] font-medium text-amber-200 hover:bg-amber-400/20"
          >
            İleri <ChevronRight className="h-3 w-3" />
          </button>
        ) : null}
      </div>
    </article>
  );
}

function TakvimTab({
  hesaplar,
  icerikler,
  hesapFilter,
  setHesapFilter,
  month,
  setMonth,
  onDayClick,
  onItemClick,
}: {
  hesaplar: IcHesap[];
  icerikler: IcIcerikWithHesap[];
  hesapFilter: string | "all";
  setHesapFilter: (v: string | "all") => void;
  month: { y: number; m: number };
  setMonth: (v: { y: number; m: number }) => void;
  onDayClick: (date: string) => void;
  onItemClick: (item: IcIcerikWithHesap) => void;
}) {
  const first = new Date(month.y, month.m, 1);
  const startPad = (first.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDate = useMemo(() => {
    const map = new Map<string, IcIcerikWithHesap[]>();
    for (const item of icerikler) {
      if (!item.planlanan_tarih) continue;
      const list = map.get(item.planlanan_tarih) ?? [];
      list.push(item);
      map.set(item.planlanan_tarih, list);
    }
    return map;
  }, [icerikler]);

  // Gap warning: planned dates across month with >2 day gaps
  const gapDays = useMemo(() => {
    const planned = [...byDate.keys()].sort();
    const gaps = new Set<string>();
    for (let i = 0; i < planned.length - 1; i++) {
      const a = new Date(planned[i]! + "T12:00:00");
      const b = new Date(planned[i + 1]! + "T12:00:00");
      const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
      if (diff > 2) {
        for (let d = 1; d < diff; d++) {
          const mid = new Date(a);
          mid.setDate(a.getDate() + d);
          if (mid.getMonth() === month.m && mid.getFullYear() === month.y) {
            gaps.add(mid.toISOString().slice(0, 10));
          }
        }
      }
    }
    return gaps;
  }, [byDate, month.m, month.y]);

  const label = first.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <HesapChips
        hesaplar={hesaplar.filter((h) => h.aktif)}
        hesapFilter={hesapFilter}
        setHesapFilter={setHesapFilter}
      />
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-sm text-[#6b6158] hover:bg-[#1a1612]/5"
          onClick={() => {
            const d = new Date(month.y, month.m - 1, 1);
            setMonth({ y: d.getFullYear(), m: d.getMonth() });
          }}
        >
          ←
        </button>
        <h3 className="text-sm font-medium capitalize text-[#1a1612]/80">{label}</h3>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-sm text-[#6b6158] hover:bg-[#1a1612]/5"
          onClick={() => {
            const d = new Date(month.y, month.m + 1, 1);
            setMonth({ y: d.getFullYear(), m: d.getMonth() });
          }}
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-[#1a1612]/40">
        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day == null) {
            return <div key={`e-${idx}`} className="min-h-[88px]" />;
          }
          const date = `${month.y}-${String(month.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const items = byDate.get(date) ?? [];
          const isGap = gapDays.has(date) && items.length === 0;
          const isToday = date === todayISO();
          return (
            <button
              key={date}
              type="button"
              onClick={() => onDayClick(date)}
              className={`min-h-[88px] rounded-lg border p-1.5 text-left transition hover:border-amber-400/30 ${
                isGap
                  ? "border-rose-400/25 bg-rose-500/[0.07]"
                  : isToday
                    ? "border-amber-400/35 bg-amber-400/[0.06]"
                    : "border-[#e8e0d4] bg-[#1a1612]/5"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] text-[#6b6158]">{day}</span>
                {isGap ? (
                  <span className="text-[9px] text-rose-300/80" title="Bu aralıkta paylaşım yok">
                    !
                  </span>
                ) : null}
              </div>
              <div className="space-y-0.5">
                {items.slice(0, 3).map((item) => (
                  <span
                    key={item.id}
                    role="link"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemClick(item);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        onItemClick(item);
                      }
                    }}
                    className="block truncate rounded px-1 py-0.5 text-[9px] font-medium text-black/80"
                    style={{ background: item.hesap?.renk ?? "#c9a65a" }}
                  >
                    {item.hesap?.ad?.slice(0, 8)} · {IC_TUR_LABEL[item.tur]}
                  </span>
                ))}
                {items.length > 3 ? (
                  <span className="text-[9px] text-[#1a1612]/40">+{items.length - 3}</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-[#1a1612]/40">
        Boş güne tıkla → yeni içerik. Renkli etiketlere tıkla → düzenle. Kırmızı
        günler: 2+ gün boşluk uyarısı.
      </p>
    </div>
  );
}

function HesaplarTab({
  hesaplar,
  icerikler,
  onRefresh,
}: {
  hesaplar: IcHesap[];
  icerikler: IcIcerikWithHesap[];
  onRefresh: () => Promise<void>;
}) {
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const monthStart = todayISO().slice(0, 8) + "01";

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/15 px-3 py-1.5 text-sm text-amber-200 hover:bg-amber-400/25"
        >
          <Plus className="h-4 w-4" /> Yeni hesap
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hesaplar.map((h) => {
          const monthItems = icerikler.filter((i) => i.hesap_id === h.id);
          const planned = monthItems.filter(
            (i) => i.planlanan_tarih && i.planlanan_tarih >= monthStart
          ).length;
          const shared = monthItems.filter(
            (i) =>
              i.durum === "paylasildi" &&
              i.paylasim_tarihi &&
              i.paylasim_tarihi >= monthStart
          ).length;
          const lastShared = monthItems
            .filter((i) => i.paylasim_tarihi)
            .sort((a, b) =>
              (b.paylasim_tarihi ?? "").localeCompare(a.paylasim_tarihi ?? "")
            )[0]?.paylasim_tarihi;

          return (
            <div
              key={h.id}
              className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 p-4"
              style={{ boxShadow: `inset 4px 0 0 ${h.renk}` }}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-[#1a1612]">{h.ad}</h3>
                  <p className="mt-1 flex gap-1 text-sm">
                    {h.platformlar.map((p) => (
                      <span key={p} title={IC_PLATFORM_LABEL[p]}>
                        {PLATFORM_ICON[p]}
                      </span>
                    ))}
                  </p>
                </div>
                {!h.aktif ? (
                  <span className="text-[10px] text-[#1a1612]/40">pasif</span>
                ) : null}
              </div>
              <dl className="mt-3 space-y-1 text-xs text-[#6b6158]">
                <div className="flex justify-between">
                  <dt>Bu ay planlanan</dt>
                  <dd className="text-[#1a1612]/80">{planned}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Bu ay paylaşılan</dt>
                  <dd className="text-[#1a1612]/80">{shared}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Son paylaşım</dt>
                  <dd className="text-[#1a1612]/80">{formatDate(lastShared ?? null)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => setEditId(h.id)}
                className="mt-3 text-xs text-amber-300/80 hover:text-amber-200"
              >
                Düzenle
              </button>
            </div>
          );
        })}
      </div>

      {showNew ? (
        <HesapFormModal
          onClose={() => setShowNew(false)}
          onSaved={async () => {
            setShowNew(false);
            await onRefresh();
          }}
        />
      ) : null}
      {editId ? (
        <HesapFormModal
          hesap={hesaplar.find((h) => h.id === editId)}
          onClose={() => setEditId(null)}
          onSaved={async () => {
            setEditId(null);
            await onRefresh();
          }}
        />
      ) : null}
    </div>
  );
}

function AyarlarTab({
  hesaplar,
  icerikler,
  onRefresh,
}: {
  hesaplar: IcHesap[];
  icerikler: IcIcerikWithHesap[];
  onRefresh: () => Promise<void>;
}) {
  const monthStart = todayISO().slice(0, 8) + "01";
  const today = todayISO();
  const next7 = new Date();
  next7.setDate(next7.getDate() + 7);
  const next7Str = next7.toISOString().slice(0, 10);

  const monthPlanned = icerikler.filter(
    (i) => i.planlanan_tarih && i.planlanan_tarih >= monthStart
  ).length;
  const monthShared = icerikler.filter(
    (i) =>
      i.durum === "paylasildi" &&
      i.paylasim_tarihi &&
      i.paylasim_tarihi >= monthStart
  ).length;
  const upcoming = icerikler
    .filter(
      (i) =>
        i.planlanan_tarih &&
        i.planlanan_tarih >= today &&
        i.planlanan_tarih <= next7Str &&
        i.durum !== "paylasildi"
    )
    .sort((a, b) =>
      (a.planlanan_tarih ?? "").localeCompare(b.planlanan_tarih ?? "")
    );

  async function toggleHedef(h: IcHesap) {
    await fetch("/api/admin/icerik/hesaplar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: h.id,
        hedef_iki_gunde_bir: !h.hedef_iki_gunde_bir,
      }),
    });
    await onRefresh();
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-medium text-[#1a1612]/70">
          İki günde bir paylaşım hedefi
        </h3>
        <ul className="space-y-2">
          {hesaplar.map((h) => (
            <li
              key={h.id}
              className="flex items-center justify-between rounded-lg border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2.5"
            >
              <span className="flex items-center gap-2 text-sm text-[#1a1612]/80">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: h.renk }}
                />
                {h.ad}
              </span>
              <button
                type="button"
                onClick={() => toggleHedef(h)}
                className={`relative h-6 w-11 rounded-full transition ${
                  h.hedef_iki_gunde_bir ? "bg-amber-400/70" : "bg-[#1a1612]/8"
                }`}
                aria-pressed={h.hedef_iki_gunde_bir}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                    h.hedef_iki_gunde_bir ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-[#1a1612]/70">Bu ay</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 p-4">
            <p className="text-[11px] uppercase tracking-wider text-[#1a1612]/40">
              Planlanan
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#1a1612]">
              {monthPlanned}
            </p>
          </div>
          <div className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 p-4">
            <p className="text-[11px] uppercase tracking-wider text-[#1a1612]/40">
              Paylaşılan
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#1a1612]">
              {monthShared}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-[#1a1612]/70">
          Gelecek 7 gün
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[#1a1612]/40">Planlanmış içerik yok.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between rounded-lg border border-[#e8e0d4] px-3 py-2 text-sm"
              >
                <span className="truncate text-[#1a1612]/80">
                  <span
                    className="mr-2 inline-block h-2 w-2 rounded-full"
                    style={{ background: i.hesap?.renk }}
                  />
                  {i.baslik}
                </span>
                <span className="shrink-0 text-xs text-[#1a1612]/40">
                  {formatDate(i.planlanan_tarih)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function IcerikModal({
  mode,
  hesaplar,
  initialDurum,
  initialPlanlanan,
  item,
  busy,
  onClose,
  onSaved,
  setBusy,
  setError,
}: {
  mode: "create" | "edit";
  hesaplar: IcHesap[];
  initialDurum?: IcDurum;
  initialPlanlanan?: string | null;
  item?: IcIcerikWithHesap;
  busy: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  setBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
}) {
  const [hesapId, setHesapId] = useState(
    item?.hesap_id ?? hesaplar[0]?.id ?? ""
  );
  const selectedHesap = hesaplar.find((h) => h.id === hesapId);
  const [tur, setTur] = useState<IcTur>(item?.tur ?? "post");
  const [platforms, setPlatforms] = useState<IcPlatform[]>(
    item ? [item.platform] : selectedHesap?.platformlar.slice(0, 1) ?? ["instagram"]
  );
  const [baslik, setBaslik] = useState(item?.baslik ?? "");
  const [aciklama, setAciklama] = useState(item?.aciklama ?? "");
  const [planlanan, setPlanlanan] = useState(
    item?.planlanan_tarih ?? initialPlanlanan ?? ""
  );
  const [durum, setDurum] = useState<IcDurum>(
    item?.durum ?? initialDurum ?? "fikir"
  );
  const [hatirlatma, setHatirlatma] = useState("");

  useEffect(() => {
    if (mode === "create" && selectedHesap) {
      setPlatforms((prev) =>
        prev.filter((p) => selectedHesap.platformlar.includes(p)).length
          ? prev.filter((p) => selectedHesap.platformlar.includes(p))
          : selectedHesap.platformlar.slice(0, 1)
      );
    }
  }, [hesapId, mode, selectedHesap]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "create") {
        const res = await fetch("/api/admin/icerik/icerikler", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hesap_id: hesapId,
            tur,
            platforms,
            baslik,
            aciklama,
            durum,
            planlanan_tarih: planlanan || null,
            hatirlatma_zamani: hatirlatma
              ? new Date(hatirlatma).toISOString()
              : null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
      } else if (item) {
        const res = await fetch("/api/admin/icerik/icerikler", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: item.id,
            hesap_id: hesapId,
            tur,
            platform: platforms[0] ?? item.platform,
            baslik,
            aciklama,
            durum,
            planlanan_tarih: planlanan || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Güncellenemedi");
      }
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell title={mode === "create" ? "Yeni içerik" : "İçeriği düzenle"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <AdminFieldLabel required>Hesap</AdminFieldLabel>
          <select
            value={hesapId}
            onChange={(e) => setHesapId(e.target.value)}
            className="w-full rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3.5 py-2.5 text-sm text-[#1a1612]"
            required
          >
            {hesaplar.map((h) => (
              <option key={h.id} value={h.id} style={{ color: "#111" }}>
                {h.ad}
              </option>
            ))}
          </select>
        </div>

        <div>
          <AdminFieldLabel required>Tür</AdminFieldLabel>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(IC_TUR_LABEL) as IcTur[]).map((t) => (
              <label
                key={t}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs ${
                  tur === t
                    ? "border-amber-400/40 bg-amber-400/15 text-amber-100"
                    : "border-[#e8e0d4] text-[#6b6158]"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={tur === t}
                  onChange={() => setTur(t)}
                />
                {IC_TUR_LABEL[t]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <AdminFieldLabel required>Platform</AdminFieldLabel>
          <div className="flex flex-wrap gap-2">
            {(selectedHesap?.platformlar ?? []).map((p) => {
              const on = platforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setPlatforms((prev) =>
                      on
                        ? prev.filter((x) => x !== p)
                        : mode === "edit"
                          ? [p]
                          : [...prev, p]
                    )
                  }
                  className={`rounded-lg border px-3 py-1.5 text-xs ${
                    on
                      ? "border-amber-400/40 bg-amber-400/15 text-amber-100"
                      : "border-[#e8e0d4] text-[#6b6158]"
                  }`}
                >
                  {PLATFORM_ICON[p]} {IC_PLATFORM_LABEL[p]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <AdminFieldLabel required htmlFor="ic-baslik">
            Başlık
          </AdminFieldLabel>
          <AdminTextInput
            id="ic-baslik"
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            required
          />
        </div>

        <div>
          <AdminFieldLabel htmlFor="ic-aciklama">Açıklama / fikir</AdminFieldLabel>
          <AdminTextArea
            id="ic-aciklama"
            rows={3}
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <AdminFieldLabel htmlFor="ic-plan">Planlanan tarih</AdminFieldLabel>
            <AdminTextInput
              id="ic-plan"
              type="date"
              value={planlanan}
              onChange={(e) => setPlanlanan(e.target.value)}
            />
          </div>
          <div>
            <AdminFieldLabel>Durum</AdminFieldLabel>
            <select
              value={durum}
              onChange={(e) => setDurum(e.target.value as IcDurum)}
              className="w-full rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3.5 py-2.5 text-sm text-[#1a1612]"
            >
              {IC_DURUMLAR.map((d) => (
                <option key={d} value={d} style={{ color: "#111" }}>
                  {IC_DURUM_LABEL[d]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {mode === "create" ? (
          <div>
            <AdminFieldLabel htmlFor="ic-hatir">Hatırlatıcı</AdminFieldLabel>
            <AdminTextInput
              id="ic-hatir"
              type="datetime-local"
              value={hatirlatma}
              onChange={(e) => setHatirlatma(e.target.value)}
            />
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-[#6b6158] hover:bg-[#1a1612]/5"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={busy || !baslik.trim() || platforms.length === 0}
            className="rounded-lg bg-amber-400/20 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-400/30 disabled:opacity-40"
          >
            Kaydet
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function HesapFormModal({
  hesap,
  onClose,
  onSaved,
}: {
  hesap?: IcHesap;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [ad, setAd] = useState(hesap?.ad ?? "");
  const [renk, setRenk] = useState(hesap?.renk ?? "#c9a65a");
  const [platforms, setPlatforms] = useState<IcPlatform[]>(
    hesap?.platformlar ?? ["instagram"]
  );
  const [aktif, setAktif] = useState(hesap?.aktif ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/icerik/hesaplar", {
        method: hesap ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          hesap
            ? { id: hesap.id, ad, renk, platformlar: platforms, aktif }
            : { ad, renk, platformlar: platforms }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell title={hesap ? "Hesabı düzenle" : "Yeni hesap"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {error ? (
          <p className="text-sm text-rose-300">{error}</p>
        ) : null}
        <div>
          <AdminFieldLabel required>Ad</AdminFieldLabel>
          <AdminTextInput value={ad} onChange={(e) => setAd(e.target.value)} required />
        </div>
        <div>
          <AdminFieldLabel>Renk</AdminFieldLabel>
          <input
            type="color"
            value={renk}
            onChange={(e) => setRenk(e.target.value)}
            className="h-10 w-full cursor-pointer rounded-lg border border-[#e8e0d4] bg-transparent"
          />
        </div>
        <div>
          <AdminFieldLabel>Platformlar</AdminFieldLabel>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(IC_PLATFORM_LABEL) as IcPlatform[]).map((p) => {
              const on = platforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setPlatforms((prev) =>
                      on ? prev.filter((x) => x !== p) : [...prev, p]
                    )
                  }
                  className={`rounded-lg border px-3 py-1.5 text-xs ${
                    on
                      ? "border-amber-400/40 bg-amber-400/15 text-amber-100"
                      : "border-[#e8e0d4] text-[#6b6158]"
                  }`}
                >
                  {IC_PLATFORM_LABEL[p]}
                </button>
              );
            })}
          </div>
        </div>
        {hesap ? (
          <label className="flex items-center gap-2 text-sm text-[#1a1612]/70">
            <input
              type="checkbox"
              checked={aktif}
              onChange={(e) => setAktif(e.target.checked)}
            />
            Aktif
          </label>
        ) : null}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-[#6b6158]">
            İptal
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-amber-400/20 px-4 py-2 text-sm text-amber-100"
          >
            Kaydet
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e8e0d4] bg-[#faf7f2] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#1a1612]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#1a1612]/40 hover:bg-[#1a1612]/5 hover:text-[#1a1612]/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
