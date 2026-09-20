"use client";

import { useEffect, useRef, useState } from "react";
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
import type { Karalama } from "@/lib/karalamalar";

type Props = {
  initial?: Karalama | null;
  recent?: Karalama[];
  onDone?: () => void;
};

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

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(baslik));
  }, [baslik, slugTouched]);

  async function handleSubmit(e: React.FormEvent) {
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

  const recentItems = (initial ? [] : recent)
    .slice(0, 5)
    .map((k) => ({
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
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
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
          <p className="mt-1 text-[11px] text-white/35">Otomatik üretilir; istersen düzenle.</p>
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
        </div>

        <AdminOptionalSection>
          <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-white/75">
            <span>Yayında</span>
            <button
              type="button"
              role="switch"
              aria-checked={yayinda}
              onClick={() => setYayinda((v) => !v)}
              className={`relative h-7 w-12 rounded-full transition ${
                yayinda ? "bg-amber-500" : "bg-white/20"
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
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5"
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
    </form>
  );
}
