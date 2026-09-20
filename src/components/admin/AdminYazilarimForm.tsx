"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
  { ssr: false }
);

const CATEGORIES = [
  { value: "denemeler", label: "Denemeler" },
  { value: "siirler", label: "Şiirler" },
  { value: "diger", label: "Diğer" },
] as const;

export function AdminYazilarimForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bodyHtml, setBodyHtml] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string)?.trim() ?? "";
    const category = (fd.get("category") as string) || "diger";
    const published_at = (fd.get("published_at") as string) || new Date().toISOString().slice(0, 16);
    const tefrika_issue = (fd.get("tefrika_issue") as string)?.trim() || null;
    const external_url = (fd.get("external_url") as string)?.trim() || null;
    const body = bodyHtml;

    if (!title) {
      setError("Başlık gerekli.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/writings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: CATEGORIES.some((c) => c.value === category) ? category : "diger",
          title,
          body,
          published_at: new Date(published_at).toISOString(),
          tefrika_issue,
          external_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kaydedilemedi.");
        return;
      }
      (e.target as HTMLFormElement).reset();
      setBodyHtml("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="admin-bento-card p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3 border-b border-white/[0.06] pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(212,175,55,0.12)] text-[#d4af37]">
          <PenLine className="h-5 w-5" />
        </div>
        <div>
          <h3 className="admin-section-title">Yeni yazı</h3>
          <p className="mt-0.5 text-sm text-white/45">Başlık, kategori ve içeriği kaydet</p>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="admin-label" htmlFor="writing-category">
            Kategori
          </label>
          <select
            id="writing-category"
            name="category"
            className="admin-input admin-select"
            defaultValue="denemeler"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label" htmlFor="writing-date">
            Tarih
          </label>
          <input
            id="writing-date"
            name="published_at"
            type="datetime-local"
            className="admin-input"
            defaultValue={today}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="admin-label" htmlFor="writing-title">
          Başlık *
        </label>
        <input
          id="writing-title"
          name="title"
          type="text"
          required
          placeholder="Yazı başlığı"
          className="admin-input admin-input-lg"
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="admin-label" htmlFor="writing-tefrika">
            Tefrika sayısı
          </label>
          <input
            id="writing-tefrika"
            name="tefrika_issue"
            type="text"
            placeholder="Örn. 5"
            className="admin-input"
          />
          <p className="admin-hint">Sadece Diğer kategorisi — doluysa Tefrika kartı olarak listelenir.</p>
        </div>
        <div>
          <label className="admin-label" htmlFor="writing-external">
            Dergiyi satın al
          </label>
          <input
            id="writing-external"
            name="external_url"
            type="url"
            placeholder="https://..."
            className="admin-input"
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="admin-label">İçerik</label>
        <RichTextEditor
          value={bodyHtml}
          onChange={setBodyHtml}
          placeholder="Yazı içeriği…"
          minHeight="16rem"
          variant="admin"
        />
        <input type="hidden" name="body" value={bodyHtml} readOnly aria-hidden />
      </div>

      <div className="mt-8 flex justify-end">
        <button type="submit" disabled={loading} className="admin-btn-gold disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? "Ekleniyor…" : "Yazıyı ekle"}
        </button>
      </div>
    </form>
  );
}
