"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

const RichTextEditor = dynamic(
  () => import("./RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
  { ssr: false }
);

type Writing = {
  id: string;
  category: string;
  title: string;
  body: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  tefrika_issue: string | null;
  external_url: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  denemeler: "Denemeler",
  siirler: "Şiirler",
  diger: "Diğer",
};

const CATEGORY_ORDER = ["denemeler", "siirler", "diger"];

const inputClass = "w-full rounded-lg border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500";
const labelClass = "mb-1 block text-sm font-medium text-white/80";

export function AdminYazilarimList({ initialWritings }: { initialWritings: Writing[] }) {
  const router = useRouter();
  const [writings, setWritings] = useState(initialWritings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] ?? cat,
    items: writings.filter((w) => w.category === cat),
  }));

  async function handleUpdate(id: string, payload: { category?: string; title?: string; body?: string; published_at?: string; tefrika_issue?: string | null; external_url?: string | null }) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/writings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Güncellenemedi.");
        return;
      }
      const updated = await res.json();
      setWritings((prev) => prev.map((w) => (w.id === id ? updated : w)));
      setEditingId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/writings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Silinemedi.");
        return;
      }
      setWritings((prev) => prev.filter((w) => w.id !== id));
      setEditingId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function formatDate(iso: string | null | undefined): string {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "";
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {byCategory.map(({ category, label, items }) => (
        <div key={category} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-4">
          <h3 className="mb-3 font-medium text-white">{label}</h3>
          {items.length === 0 ? (
            <p className="text-sm text-white/60">Bu kategoride yazı yok.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((w) => (
                <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 p-3">
                  {editingId === w.id ? (
                    <EditForm
                      writing={w}
                      onSave={(p) => handleUpdate(w.id, p)}
                      onCancel={() => setEditingId(null)}
                      disabled={loading}
                    />
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <Link href={`/yazilarim/${w.id}`} target="_blank" className="font-medium text-amber-400 hover:text-amber-300 hover:underline">
                          {w.title || "—"}
                        </Link>
                        <span className="ml-2 text-sm text-white/60">{formatDate(w.published_at)}</span>
                      </div>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => setEditingId(w.id)} className="rounded p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Düzenle">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(w.id)} className="rounded p-2 text-white/60 hover:bg-red-500/20 hover:text-red-400" aria-label="Sil">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function EditForm({
  writing,
  onSave,
  onCancel,
  disabled,
}: {
  writing: Writing;
  onSave: (p: { category?: string; title?: string; body?: string; published_at?: string; tefrika_issue?: string | null; external_url?: string | null }) => void;
  onCancel: () => void;
  disabled: boolean;
}) {
  const [category, setCategory] = useState(writing.category);
  const [title, setTitle] = useState(writing.title);
  const [body, setBody] = useState(writing.body);
  const [published_at, setPublishedAt] = useState(
    writing.published_at ? String(writing.published_at).slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [tefrika_issue, setTefrikaIssue] = useState(writing.tefrika_issue ?? "");
  const [external_url, setExternalUrl] = useState(writing.external_url ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          category,
          title,
          body,
          published_at: new Date(published_at).toISOString(),
          tefrika_issue: tefrika_issue.trim() || null,
          external_url: external_url.trim() || null,
        });
      }}
      className="w-full space-y-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Kategori</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Tarih</label>
          <input type="datetime-local" value={published_at} onChange={(e) => setPublishedAt(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Başlık</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Tefrika sayısı</label>
          <input type="text" value={tefrika_issue} onChange={(e) => setTefrikaIssue(e.target.value)} placeholder="Örn. 5" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Dergiyi Satın Al linki</label>
          <input type="url" value={external_url} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://..." className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>İçerik</label>
        <RichTextEditor value={body} onChange={setBody} placeholder="Yazı içeriği…" minHeight="10rem" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={disabled} className="rounded bg-[var(--primary)] px-3 py-1.5 text-sm text-[var(--primary-foreground)] disabled:opacity-50">Kaydet</button>
        <button type="button" onClick={onCancel} className="rounded border border-[var(--card-border)] px-3 py-1.5 text-sm">İptal</button>
      </div>
    </form>
  );
}
