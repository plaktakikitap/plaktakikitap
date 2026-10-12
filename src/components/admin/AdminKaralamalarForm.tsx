"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import { isRichHtml, sanitizeRichHtml } from "@/lib/rich-html";
import {
  formatIstanbul,
  isFutureInstant,
  istanbulLocalToUtc,
  utcToIstanbulInput,
} from "@/lib/istanbul-time";
import { showAdminToast } from "./admin-toast-events";
import { PublishBar } from "./PublishBar";
import {
  AdminFieldLabel,
  AdminRecentList,
  AdminTextInput,
  useAdminCmdEnter,
} from "./AdminFormPrimitives";
import type { Karalama, KaralamaVersiyon } from "@/lib/karalamalar";

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
  { ssr: false }
);

type YayinNiyeti = "yayinla" | "taslak" | "zamanla";

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
  const niyetRef = useRef<YayinNiyeti>("yayinla");
  useAdminCmdEnter(formRef);

  const [baslik, setBaslik] = useState(initial?.baslik ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [icerik, setIcerik] = useState(initial?.icerik ?? "");
  const [zamanOpen, setZamanOpen] = useState(false);
  const [zaman, setZaman] = useState(() =>
    initial?.yayin_zamani && isFutureInstant(initial.yayin_zamani)
      ? utcToIstanbulInput(initial.yayin_zamani)
      : ""
  );
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

  async function kaydet(niyet: YayinNiyeti) {
    const icerikText = icerik.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim();
    if (!baslik.trim() || !icerikText) {
      showAdminToast("error", "Başlık ve içerik zorunludur.");
      return;
    }

    let yayinZamani: string | null = null;
    if (niyet === "zamanla") {
      const utc = istanbulLocalToUtc(zaman);
      if (!utc || !isFutureInstant(utc)) {
        showAdminToast("error", "Türkiye saatine göre gelecek bir zaman seç.");
        return;
      }
      yayinZamani = utc;
    }

    setLoading(true);
    try {
      const payload = {
        baslik,
        icerik,
        slug,
        yayinda: niyet !== "taslak",
        yayin_zamani: yayinZamani,
      };
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
      const mesaj =
        niyet === "zamanla" && yayinZamani
          ? `${formatIstanbul(yayinZamani)} TSİ'de yayınlanacak`
          : niyet === "taslak"
            ? "Taslağa alındı"
            : initial
              ? "Yayınlandı ✓"
              : "Karalama yayınlandı ✓";
      showAdminToast("success", mesaj);
      if (initial) {
        const vRes = await fetch(
          `/api/admin/karalamalar/${initial.id}/versiyonlar`
        );
        if (vRes.ok) setVersiyonlar(await vRes.json());
        onDone?.();
      } else {
        setBaslik("");
        setSlug("");
        setSlugTouched(false);
        setIcerik("");
        setZaman("");
        setZamanOpen(false);
      }
      router.refresh();
    } catch {
      showAdminToast("error", "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const niyet = niyetRef.current;
    niyetRef.current = "yayinla";
    void kaydet(niyet);
  }

  function iste(niyet: YayinNiyeti) {
    if (niyet === "zamanla" && !zamanOpen) {
      setZamanOpen(true);
      return;
    }
    niyetRef.current = niyet;
    formRef.current?.requestSubmit();
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
          <p className="mt-1 text-[11px] text-[#6b6158]">
            Otomatik üretilir; istersen düzenle.
          </p>
        </div>

        <div>
          <AdminFieldLabel required className="mb-2">
            İçerik
          </AdminFieldLabel>
          <RichTextEditor
            value={icerik}
            onChange={setIcerik}
            placeholder="Karalama içeriği…"
            minHeight="220px"
          />
        </div>

        <div className="flex items-end justify-between gap-3">
          {initial && onDone ? (
            <button
              type="button"
              onClick={onDone}
              className="rounded-xl border border-[#e8e0d4] px-4 py-2.5 text-sm text-[#1a1612] hover:bg-[#1a1612]/5"
            >
              İptal
            </button>
          ) : (
            <span />
          )}
          <PublishBar
            loading={loading}
            scheduledLabel={
              initial?.yayin_zamani && isFutureInstant(initial.yayin_zamani)
                ? `${formatIstanbul(initial.yayin_zamani)} TSİ'de yayınlanacak`
                : null
            }
            zamanOpen={zamanOpen}
            zamanValue={zaman}
            onZamanChange={setZaman}
            onTaslak={() => iste("taslak")}
            onZamanla={() => iste("zamanla")}
          />
        </div>
      </div>

      {initial && versiyonlar.length > 0 ? (
        <section className="mt-8 opacity-80">
          <h4 className="mb-4 text-[0.75rem] font-medium tracking-[0.1em] text-[#6b6158]">
            DÜZENLEME GEÇMİŞİ
          </h4>
          {versiyonlar.map((v) => (
            <div
              key={v.id}
              className="mb-4 border-l-2 border-[rgba(201,166,90,0.2)] pl-4"
            >
              <div className="text-[0.78rem] text-[#6b6158]">
                Versiyon {v.versiyon_no} — {formatVersiyonTarih(v.olusturma_tarihi)}{" "}
                <span className="text-[#6b6158]">
                  ({alanLabel(v.degistiren_alan)} değişti)
                </span>
              </div>
              <details className="mt-1.5">
                <summary className="cursor-pointer text-[0.82rem] text-[#6b6158]">
                  Önceki hali gör
                </summary>
                <div className="mt-2 text-[0.85rem] text-[#1a1612]">
                  <strong className="text-[#1a1612]">{v.baslik}</strong>
                  {isRichHtml(v.icerik) ? (
                    <div
                      className="mt-1 [&_p]:my-1 [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(v.icerik) }}
                    />
                  ) : (
                    <p className="mt-1 whitespace-pre-wrap">{v.icerik}</p>
                  )}
                </div>
              </details>
              <button
                type="button"
                onClick={() => versiyonuGeriYukle(v)}
                className="mt-1 border-0 bg-transparent p-0 text-[0.75rem] text-[#b8934a] hover:underline"
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
