"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, X } from "lucide-react";
import type {
  DilKelime,
  DilKodu,
  DilNot,
  DilNotKategori,
  DilStats,
  DilZorluk,
} from "@/types/dil";
import { showAdminToast } from "./admin-toast-events";

const ETIKETLER = ["fiil", "isim", "sıfat", "deyim", "diğer"] as const;
const ZORLUKLAR: { id: DilZorluk; label: string }[] = [
  { id: "kolay", label: "Kolay" },
  { id: "orta", label: "Orta" },
  { id: "zor", label: "Zor" },
];
const NOT_KATS: { id: DilNotKategori; label: string }[] = [
  { id: "gramer", label: "Gramer" },
  { id: "telaffuz", label: "Telaffuz" },
  { id: "deyim", label: "Deyimler" },
  { id: "genel", label: "Genel" },
];

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-amber-400/40";

type Tab = "banka" | "flashcard" | "notlar";

export interface DilSayfasiProps {
  dil: DilKodu;
  bayrak: string;
  arapcaMod?: boolean;
  amiriClassName?: string;
  initialStats: DilStats;
  initialKelimeler: DilKelime[];
  initialTotal: number;
  initialNotlar: DilNot[];
}

export function DilSayfasi({
  dil,
  bayrak,
  arapcaMod = false,
  amiriClassName = "",
  initialStats,
  initialKelimeler,
  initialTotal,
  initialNotlar,
}: DilSayfasiProps) {
  const [tab, setTab] = useState<Tab>("banka");
  const [stats, setStats] = useState(initialStats);

  async function refreshStats() {
    const res = await fetch(`/api/admin/diller/kelimeler?dil=${dil}&mode=stats`);
    if (res.ok) setStats(await res.json());
  }

  const pct =
    stats.kelime_sayisi > 0
      ? Math.round((stats.ogrenilen / stats.kelime_sayisi) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
        {bayrak}{" "}
        <span className="font-medium">
          {stats.kelime_sayisi} kelime · {stats.ogrenilen} öğrenildi ·{" "}
          {stats.not_sayisi} not
        </span>
        {stats.kelime_sayisi > 0 ? (
          <span className="ml-2 text-amber-200/60">(%{pct})</span>
        ) : null}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-amber-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["banka", "Kelime Bankası"],
            ["flashcard", "Flashcard"],
            ["notlar", "Notlar"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-xl px-4 py-2 text-sm transition ${
              tab === id
                ? "bg-amber-500 text-black"
                : "bg-white/5 text-white/55 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "banka" ? (
        <KelimeBankasi
          dil={dil}
          arapcaMod={arapcaMod}
          amiriClassName={amiriClassName}
          initialItems={initialKelimeler}
          initialTotal={initialTotal}
          onChanged={refreshStats}
        />
      ) : null}
      {tab === "flashcard" ? (
        <FlashcardModu
          dil={dil}
          arapcaMod={arapcaMod}
          amiriClassName={amiriClassName}
          onChanged={refreshStats}
        />
      ) : null}
      {tab === "notlar" ? (
        <NotlarBolumu
          dil={dil}
          initialNotlar={initialNotlar}
          onChanged={refreshStats}
        />
      ) : null}
    </div>
  );
}

/* ——— Kelime Bankası ——— */

function KelimeBankasi({
  dil,
  arapcaMod,
  amiriClassName,
  initialItems,
  initialTotal,
  onChanged,
}: {
  dil: DilKodu;
  arapcaMod: boolean;
  amiriClassName: string;
  initialItems: DilKelime[];
  initialTotal: number;
  onChanged: () => void;
}) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [q, setQ] = useState("");
  const [etiket, setEtiket] = useState("");
  const [zorluk, setZorluk] = useState("");
  const [ogrenildi, setOgrenildi] = useState<"all" | "true" | "false">("all");
  const [sort, setSort] = useState<"yeni" | "alfa" | "tekrar">("yeni");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  const [kelime, setKelime] = useState("");
  const [anlam, setAnlam] = useState("");
  const [ornek, setOrnek] = useState("");
  const [telaffuz, setTelaffuz] = useState("");
  const [arapcaYazi, setArapcaYazi] = useState("");
  const [formZorluk, setFormZorluk] = useState<DilZorluk>("orta");
  const [formEtiket, setFormEtiket] = useState<string[]>([]);
  const [editing, setEditing] = useState<DilKelime | null>(null);

  const fetchList = useCallback(
    async (nextOffset = 0, append = false) => {
      const params = new URLSearchParams({
        dil,
        sort,
        ogrenildi,
        limit: "40",
        offset: String(nextOffset),
      });
      if (q.trim()) params.set("q", q.trim());
      if (etiket) params.set("etiket", etiket);
      if (zorluk) params.set("zorluk", zorluk);
      const res = await fetch(`/api/admin/diller/kelimeler?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setTotal(data.total);
      setOffset(nextOffset);
    },
    [dil, sort, ogrenildi, q, etiket, zorluk]
  );

  useEffect(() => {
    void fetchList(0, false);
  }, [fetchList]);

  function toggleEtiket(e: string) {
    setFormEtiket((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        dil,
        kelime,
        anlam,
        ornek_cumle: ornek || null,
        telaffuz: telaffuz || null,
        arapca_yazi: arapcaYazi || null,
        zorluk: formZorluk,
        etiket: formEtiket,
      };
      const res = await fetch(
        editing
          ? `/api/admin/diller/kelimeler/${editing.id}`
          : "/api/admin/diller/kelimeler",
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
      showAdminToast("success", editing ? "Güncellendi ✓" : "Eklendi ✓");
      setKelime("");
      setAnlam("");
      setOrnek("");
      setTelaffuz("");
      setArapcaYazi("");
      setFormZorluk("orta");
      setFormEtiket([]);
      setEditing(null);
      await fetchList(0, false);
      onChanged();
    } catch {
      showAdminToast("error", "Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  async function markLearned(item: DilKelime) {
    const res = await fetch(`/api/admin/diller/kelimeler/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ogrenildi: !item.ogrenildi }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAdminToast("error", data.error || "Güncellenemedi.");
      return;
    }
    setItems((prev) => prev.map((x) => (x.id === data.id ? data : x)));
    onChanged();
  }

  async function remove(id: string) {
    if (!confirm("Kelime silinsin mi?")) return;
    const res = await fetch(`/api/admin/diller/kelimeler/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      showAdminToast("error", "Silinemedi.");
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
    setTotal((t) => Math.max(0, t - 1));
    onChanged();
  }

  function startEdit(item: DilKelime) {
    setEditing(item);
    setKelime(item.kelime);
    setAnlam(item.anlam);
    setOrnek(item.ornek_cumle ?? "");
    setTelaffuz(item.telaffuz ?? "");
    setArapcaYazi(item.arapca_yazi ?? "");
    setFormZorluk(item.zorluk);
    setFormEtiket(item.etiket);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
      >
        {editing ? (
          <div className="flex items-center justify-between text-xs text-amber-300/80">
            Düzenleniyor
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setKelime("");
                setAnlam("");
                setOrnek("");
                setTelaffuz("");
                setArapcaYazi("");
                setFormEtiket([]);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={inputClass}
            value={kelime}
            onChange={(e) => setKelime(e.target.value)}
            placeholder="Kelime *"
            required
          />
          <input
            className={inputClass}
            value={anlam}
            onChange={(e) => setAnlam(e.target.value)}
            placeholder="Anlam (TR) *"
            required
          />
          <input
            className={`sm:col-span-2 ${inputClass}`}
            value={ornek}
            onChange={(e) => setOrnek(e.target.value)}
            placeholder="Örnek cümle"
          />
          <input
            className={inputClass}
            value={telaffuz}
            onChange={(e) => setTelaffuz(e.target.value)}
            placeholder={arapcaMod ? "Telaffuz (kitābun)" : "Telaffuz"}
          />
          {arapcaMod ? (
            <input
              className={`${inputClass} ${amiriClassName}`}
              dir="rtl"
              lang="ar"
              value={arapcaYazi}
              onChange={(e) => setArapcaYazi(e.target.value)}
              placeholder="كِتَابٌ"
            />
          ) : (
            <div />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {ZORLUKLAR.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setFormZorluk(z.id)}
              className={`rounded-lg px-2.5 py-1 text-xs ${
                formZorluk === z.id
                  ? "bg-amber-500 text-black"
                  : "bg-white/5 text-white/50"
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ETIKETLER.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => toggleEtiket(e)}
              className={`rounded-lg px-2.5 py-1 text-xs ${
                formEtiket.includes(e)
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-white/40"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {editing ? "Güncelle" : "Ekle"}
        </button>
      </form>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <input
          className={`sm:min-w-[180px] sm:flex-1 ${inputClass}`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ara (kelime / anlam / Arapça)…"
        />
        <select
          value={etiket}
          onChange={(e) => setEtiket(e.target.value)}
          className={inputClass + " sm:w-auto"}
        >
          <option value="">Tüm etiketler</option>
          {ETIKETLER.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select
          value={zorluk}
          onChange={(e) => setZorluk(e.target.value)}
          className={inputClass + " sm:w-auto"}
        >
          <option value="">Tüm zorluklar</option>
          {ZORLUKLAR.map((z) => (
            <option key={z.id} value={z.id}>
              {z.label}
            </option>
          ))}
        </select>
        <select
          value={ogrenildi}
          onChange={(e) =>
            setOgrenildi(e.target.value as "all" | "true" | "false")
          }
          className={inputClass + " sm:w-auto"}
        >
          <option value="all">Hepsi</option>
          <option value="false">Öğrenilmeyen</option>
          <option value="true">Öğrenilen</option>
        </select>
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as "yeni" | "alfa" | "tekrar")
          }
          className={inputClass + " sm:w-auto"}
        >
          <option value="yeni">En son eklenen</option>
          <option value="alfa">Alfabetik</option>
          <option value="tekrar">En az tekrar</option>
        </select>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {arapcaMod && item.arapca_yazi ? (
                  <p
                    className={`text-2xl text-white ${amiriClassName}`}
                    dir="rtl"
                    lang="ar"
                  >
                    {item.arapca_yazi}
                  </p>
                ) : null}
                <p className="text-base font-medium text-white/95">
                  {item.kelime}
                </p>
                {item.telaffuz ? (
                  <p className="text-xs text-white/40">{item.telaffuz}</p>
                ) : null}
                <p className="mt-0.5 text-sm text-white/70">{item.anlam}</p>
                {item.ornek_cumle ? (
                  <p className="mt-1 text-xs italic text-white/40">
                    {item.ornek_cumle}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">
                    {item.zorluk}
                  </span>
                  {item.etiket.map((e) => (
                    <span
                      key={e}
                      className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void markLearned(item)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] ${
                    item.ogrenildi
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {item.ogrenildi ? "Öğrendim ✓" : "Öğrendim"}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="rounded p-1.5 text-white/35 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(item.id)}
                  className="rounded p-1.5 text-white/35 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] text-white/30">
                  tekrar:{item.tekrar_sayisi}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {items.length < total ? (
        <button
          type="button"
          onClick={() => void fetchList(offset + 40, true)}
          className="w-full rounded-xl border border-white/10 py-2.5 text-sm text-white/50 hover:bg-white/5"
        >
          Daha fazla ({items.length}/{total})
        </button>
      ) : null}
    </div>
  );
}

/* ——— Flashcard ——— */

function FlashcardModu({
  dil,
  arapcaMod,
  amiriClassName,
  onChanged,
}: {
  dil: DilKodu;
  arapcaMod: boolean;
  amiriClassName: string;
  onChanged: () => void;
}) {
  const [deck, setDeck] = useState<DilKelime[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [missedIds, setMissedIds] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (onlyUnknown = true, onlyMissedIds?: string[]) => {
      setLoading(true);
      setDone(false);
      setIdx(0);
      setFlipped(false);
      setKnown(0);
      setMissedIds([]);
      if (onlyMissedIds?.length) {
        const params = new URLSearchParams({ dil, mode: "flashcard" });
        const res = await fetch(`/api/admin/diller/kelimeler?${params}`);
        const all: DilKelime[] = res.ok ? await res.json() : [];
        setDeck(all.filter((k) => onlyMissedIds.includes(k.id)));
      } else {
        const params = new URLSearchParams({
          dil,
          mode: "flashcard",
          ...(onlyUnknown ? { onlyUnknown: "1" } : {}),
        });
        const res = await fetch(`/api/admin/diller/kelimeler?${params}`);
        setDeck(res.ok ? await res.json() : []);
      }
      setLoading(false);
    },
    [dil]
  );

  useEffect(() => {
    void load(true);
  }, [load]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" && !done) {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done]);

  const card = deck[idx];

  async function answer(bildim: boolean) {
    if (!card) return;
    if (bildim) {
      setKnown((k) => k + 1);
      await fetch(`/api/admin/diller/kelimeler/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tekrar_sayisi: card.tekrar_sayisi + 1,
          son_tekrar: new Date().toISOString(),
          ogrenildi: true,
        }),
      });
    } else {
      setMissedIds((m) => [...m, card.id]);
      await fetch(`/api/admin/diller/kelimeler/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ogrenildi: false,
          son_tekrar: new Date().toISOString(),
        }),
      });
    }
    onChanged();
    if (idx + 1 >= deck.length) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setFlipped(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-white/40">Kartlar yükleniyor…</p>;
  }

  if (deck.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 p-8 text-center text-sm text-white/45">
        Öğrenilecek kelime yok. Bankaya ekle veya filtreyi değiştir.
        <button
          type="button"
          onClick={() => void load(false)}
          className="mt-4 block w-full text-amber-400 hover:underline"
        >
          Tüm kelimelerle başla
        </button>
      </div>
    );
  }

  if (done) {
    const total = deck.length;
    const pct = total ? Math.round((known / total) * 100) : 0;
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-lg text-white/90">
          {total} kart gözden geçirildi, {known} tanesini bildin (%{pct}).
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => void load(true)}
            className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm text-black"
          >
            Tekrar Başla
          </button>
          {missedIds.length > 0 ? (
            <button
              type="button"
              onClick={() => void load(false, missedIds)}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/70"
            >
              Sadece bilemediklerimi tekrar et
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <p className="text-center text-xs text-white/40">
        {idx + 1} / {deck.length} · Boşluk = çevir
      </p>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="relative w-full perspective-[1000px]"
        style={{ perspective: 1000 }}
      >
        <motion.div
          className="relative min-h-[220px] w-full rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 shadow-xl"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.35 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="flex h-full flex-col items-center justify-center gap-3"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              opacity: flipped ? 0 : 1,
              position: flipped ? "absolute" : "relative",
              inset: 0,
              padding: "2rem",
            }}
          >
            {arapcaMod && card.arapca_yazi ? (
              <p
                className={`text-4xl text-white ${amiriClassName}`}
                dir="rtl"
                lang="ar"
              >
                {card.arapca_yazi}
              </p>
            ) : (
              <p className="text-3xl font-medium text-white">{card.kelime}</p>
            )}
            {arapcaMod && card.arapca_yazi ? (
              <p className="text-sm text-white/50">{card.kelime}</p>
            ) : null}
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/45">
              {card.zorluk}
            </span>
          </div>
          <div
            className="flex h-full flex-col items-center justify-center gap-2"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              opacity: flipped ? 1 : 0,
              position: flipped ? "relative" : "absolute",
              inset: 0,
              padding: "2rem",
            }}
          >
            <p className="text-2xl font-medium text-amber-200">{card.anlam}</p>
            {card.ornek_cumle ? (
              <p className="text-sm italic text-white/45">{card.ornek_cumle}</p>
            ) : null}
            {arapcaMod && card.telaffuz ? (
              <p className="text-sm text-white/50">{card.telaffuz}</p>
            ) : null}
          </div>
        </motion.div>
      </button>

      {!flipped ? (
        <button
          type="button"
          onClick={() => setFlipped(true)}
          className="w-full rounded-xl border border-white/15 py-3 text-sm text-white/70"
        >
          Çevir
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => void answer(false)}
            className="rounded-xl border border-red-400/30 bg-red-500/10 py-3 text-sm text-red-300"
          >
            😕 Bilmedim
          </button>
          <button
            type="button"
            onClick={() => void answer(true)}
            className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 py-3 text-sm text-emerald-300"
          >
            ✓ Bildim
          </button>
        </div>
      )}
    </div>
  );
}

/* ——— Notlar ——— */

function NotlarBolumu({
  dil,
  initialNotlar,
  onChanged,
}: {
  dil: DilKodu;
  initialNotlar: DilNot[];
  onChanged: () => void;
}) {
  const [items, setItems] = useState(initialNotlar);
  const [filter, setFilter] = useState<"" | DilNotKategori>("");
  const [baslik, setBaslik] = useState("");
  const [icerik, setIcerik] = useState("");
  const [kategori, setKategori] = useState<DilNotKategori>("genel");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<DilNot | null>(null);
  const [loading, setLoading] = useState(false);

  async function reload() {
    const params = new URLSearchParams({ dil });
    if (filter) params.set("kategori", filter);
    const res = await fetch(`/api/admin/diller/notlar?${params}`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dil]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        editing
          ? `/api/admin/diller/notlar/${editing.id}`
          : "/api/admin/diller/notlar",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dil,
            baslik,
            icerik,
            kategori,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error || "Kaydedilemedi.");
        return;
      }
      showAdminToast("success", "Kaydedildi ✓");
      setBaslik("");
      setIcerik("");
      setKategori("genel");
      setEditing(null);
      await reload();
      onChanged();
    } catch {
      showAdminToast("error", "Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Not silinsin mi?")) return;
    const res = await fetch(`/api/admin/diller/notlar/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      showAdminToast("error", "Silinemedi.");
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
    onChanged();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
      >
        <input
          className={inputClass}
          value={baslik}
          onChange={(e) => setBaslik(e.target.value)}
          placeholder="Başlık *"
          required
        />
        <div className="flex flex-wrap gap-2">
          {NOT_KATS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKategori(k.id)}
              className={`rounded-lg px-2.5 py-1 text-xs ${
                kategori === k.id
                  ? "bg-amber-500 text-black"
                  : "bg-white/5 text-white/50"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <textarea
          className={inputClass + " min-h-[120px] resize-y"}
          value={icerik}
          onChange={(e) => setIcerik(e.target.value)}
          placeholder="İçerik — gramer kuralı, istisna listesi…"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {editing ? "Güncelle" : "Kaydet"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("")}
          className={`rounded-lg px-2.5 py-1 text-xs ${
            !filter ? "bg-white/20 text-white" : "bg-white/5 text-white/40"
          }`}
        >
          Hepsi
        </button>
        {NOT_KATS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setFilter(k.id)}
            className={`rounded-lg px-2.5 py-1 text-xs ${
              filter === k.id
                ? "bg-white/20 text-white"
                : "bg-white/5 text-white/40"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {items.map((n) => {
          const open = openId === n.id;
          return (
            <li
              key={n.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : n.id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white/90">{n.baslik}</p>
                  <span className="text-[10px] text-white/35">
                    {n.kategori ?? "genel"}
                  </span>
                </div>
                {!open ? (
                  <p className="mt-1 line-clamp-2 text-xs text-white/45">
                    {n.icerik.slice(0, 100)}
                    {n.icerik.length > 100 ? "…" : ""}
                  </p>
                ) : null}
              </button>
              {open ? (
                <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                    {n.icerik}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(n);
                        setBaslik(n.baslik);
                        setIcerik(n.icerik);
                        setKategori(n.kategori ?? "genel");
                      }}
                      className="text-xs text-amber-400/80"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(n.id)}
                      className="text-xs text-red-400/80"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
