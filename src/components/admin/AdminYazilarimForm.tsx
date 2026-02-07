"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
  { ssr: false }
);

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

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
    <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Kategori</label>
          <select name="category" className={inputClass} defaultValue="denemeler">
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Tarih</label>
          <input name="published_at" type="datetime-local" className={inputClass} defaultValue={today} />
        </div>
      </div>
      <div className="mt-4">
        <label className={labelClass}>Başlık *</label>
        <input name="title" type="text" required placeholder="Yazı başlığı" className={inputClass} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Tefrika sayısı (sadece Diğer için)</label>
            <input name="tefrika_issue" type="text" placeholder="Örn. 5" className={inputClass} />
            <p className="mt-1 text-xs text-[var(--muted)]">Doluysa &quot;Tefrika Dergisi&apos;nde Yayınlananlar&quot;da kart olarak gösterilir.</p>
          </div>
          <div>
            <label className={labelClass}>Dergiyi Satın Al linki</label>
            <input name="external_url" type="url" placeholder="https://..." className={inputClass} />
          </div>
        </div>
      <div className="mt-4">
        <label className={labelClass}>İçerik</label>
        <RichTextEditor value={bodyHtml} onChange={setBodyHtml} placeholder="Yazı içeriği…" minHeight="14rem" />
        <input type="hidden" name="body" value={bodyHtml} readOnly aria-hidden />
      </div>
      <button type="submit" disabled={loading} className="mt-6 rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50">
        {loading ? "Ekleniyor…" : "Ekle"}
      </button>
    </form>
  );
}
