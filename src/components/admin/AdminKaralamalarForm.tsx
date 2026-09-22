"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import { showAdminToast } from "./admin-toast-events";
import {
  AdminFieldLabel,
  AdminOptionalSection,
  AdminRecentList,
  AdminTextArea,
  AdminTextInput,
  useAdminCmdEnter,
} from "./AdminFormPrimitives";
import type { Karalama, KaralamaVersiyon } from "@/lib/karalamalar";

type Props = {
  initial?: Karalama | null;
  recent?: Karalama[];
  onDone?: () => void;
};

function formatVersiyonTarih(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function alanLabel(alan: string | null): string {
  if (alan === "baslik") return "başlık";
  if (alan === "icerik") return "içerik";
  if (alan === "ikisi") return "başlık + içerik";
  return alan ?? "içerik";
}

export function AdminKaralamalarForm({
  initial = null,
  recent = [],
  onDone,
}: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  useAdminCmdEnter(formRef);

  const [baslik, setBaslik] = useState(initial?.baslik ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [icerik, setIcerik] = useState(initial?.icerik ?? "");
  const [yayinda, setYayinda] = useState(initial?.yayinda ?? true);
  const [loading, setLoading] = useState(false);
  const [versiyonlar, setVersiyonlar] = useState<KaralamaVersiyon[]>([]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(baslik));
  }, [baslik, slugTouched]);

  useEffect(() => {
    if (!initial?.id) {
      setVersiyonlar([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/karalamalar/${initial.id}/versiyonlar`
        );
        if (!res.ok) return;
        const data = (await res.json()) as KaralamaVersiyon[];
        if (!cancelled) setVersiyonlar(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initial?.id]);

  function versiyonuGeriYukle(v: KaralamaVersiyon) {
    setBaslik(v.baslik);
    setIcerik(v.icerik);
    showAdminToast(
      "success",
      `Versiyon ${v.versiyon_no} forma yüklendi — kaydetmeyi unutma`
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!baslik.trim() || !icerik.trim()) {
      showAdminToast("error", "Başlık ve içerik zorunludur.");
      return;
    }
    setLoading(true);
    try {
      const payload = { baslik, icerik, slug, yayinda };
      const res = await fetch(
        initial
          ? `/api/admin/karalamalar/${initial.id}`
          : "/api/admin/karalamalar",
        {
          method: initial ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error ?? "Kaydedilemedi.");
        return;
      }
      if (initial) {
        showAdminToast("success", "Güncellendi ✓");
        // Yenile versiyon listesi
        const vRes = await fetch(
          `/api/admin/karalamalar/${initial.id}/versiyonlar`
        );
        if (vRes.ok) setVersiyonlar(await vRes.json());
        onDone?.();
      } else {
        showAdminToast("success", "Karalama eklendi ✓");
        setBaslik("");
        setSlug("");
        setSlugTouched(false);
        setIcerik("");
        setYayinda(true);
      }
      router.refresh();
    } catch {
      showAdminToast("error", "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const recentItems = (initial ? [] : recent).slice(0, 5).map((k) => ({
    id: k.id,
    title: k.baslik,
    meta: new Date(k.olusturma_tarihi).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    }),
  }));

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5 sm:p-6"
    >
      <AdminRecentList items={recentItems} />

      <div className="space-y-4">
        <div>
          <AdminFieldLabel htmlFor="karalama-baslik" required>
            Başlık
          </AdminFieldLabel>
          <AdminTextInput
            id="karalama-baslik"
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            required
            autoFocus={!initial}
          />
        </div>

        <div>
          <AdminFieldLabel htmlFor="karalama-slug">Slug</AdminFieldLabel>
          <AdminTextInput
            id="karalama-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="font-mono text-sm"
          />
          <p className="mt-1 text-[11px] text-[#1a1612]/40">
            Otomatik üretilir; istersen düzenle.
          </p>
        </div>

        <div>
          <AdminFieldLabel htmlFor="karalama-icerik" required>
            İçerik
          </AdminFieldLabel>
          <AdminTextArea
            id="karalama-icerik"
            value={icerik}
            onChange={(e) => setIcerik(e.target.value)}
            rows={12}
            className="min-h-[220px]"
            required
          />
          <p className="mt-1.5 text-[11px] text-[#1a1612]/40">
            Spoiler için:{" "}
            <code className="rounded bg-[#1a1612]/8 px-1 py-0.5 font-mono text-[#6b6158]">
              [spoiler]metin[/spoiler]
            </code>
          </p>
        </div>

        <AdminOptionalSection>
          <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-[#1a1612]/75">
            <span>Yayında</span>
            <button
              type="button"
              role="switch"
              aria-checked={yayinda}
              onClick={() => setYayinda((v) => !v)}
              className={`relative h-7 w-12 rounded-full transition ${
                yayinda ? "bg-amber-500" : "bg-[#1a1612]/8"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${
                  yayinda ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </label>
        </AdminOptionalSection>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {initial && onDone ? (
            <button
              type="button"
              onClick={onDone}
              className="rounded-xl border border-[#e8e0d4] px-4 py-2.5 text-sm text-[#1a1612]/70 hover:bg-[#1a1612]/5"
            >
              İptal
            </button>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? "Kaydediliyor…" : initial ? "Güncelle" : "Kaydet"}
            <span className="ml-2 hidden text-[10px] font-normal text-black/50 sm:inline">
              ⌘/Ctrl+Enter
            </span>
          </button>
        </div>
      </div>

      {initial && versiyonlar.length > 0 ? (
        <section className="mt-8 opacity-80">
          <h4 className="mb-4 text-[0.75rem] font-medium tracking-[0.1em] text-[#9a9488]">
            DÜZENLEME GEÇMİŞİ
          </h4>
          {versiyonlar.map((v) => (
            <div
              key={v.id}
              className="mb-4 border-l-2 border-[rgba(201,166,90,0.2)] pl-4"
            >
              <div className="text-[0.78rem] text-[#6b6560]">
                Versiyon {v.versiyon_no} — {formatVersiyonTarih(v.olusturma_tarihi)}{" "}
                <span className="text-[#9a9488]">
                  ({alanLabel(v.degistiren_alan)} değişti)
                </span>
              </div>
              <details className="mt-1.5">
                <summary className="cursor-pointer text-[0.82rem] text-[#9a9488]">
                  Önceki hali gör
                </summary>
                <div className="mt-2 text-[0.85rem] text-[#c8bfb0]">
                  <strong className="text-[#f3ead9]">{v.baslik}</strong>
                  <p className="mt-1 whitespace-pre-wrap">{v.icerik}</p>
                </div>
              </details>
              <button
                type="button"
                onClick={() => versiyonuGeriYukle(v)}
                className="mt-1 border-0 bg-transparent p-0 text-[0.75rem] text-[#c9a65a] hover:underline"
              >
                Bu versiyona dön
              </button>
            </div>
          ))}
        </section>
      ) : null}
    </form>
  );
}
