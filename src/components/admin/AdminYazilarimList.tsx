"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

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

  async function handleUpdate(
    id: string,
    payload: {
      category?: string;
      title?: string;
      body?: string;
      published_at?: string;
      tefrika_issue?: string | null;
      external_url?: string | null;
    }
  ) {
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
    <div className="space-y-5">
      {error ? <p className="admin-error">{error}</p> : null}

      {byCategory.map(({ category, label, items }) => (
        <div key={category} className="admin-bento-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="admin-section-title">{label}</h3>
            <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-white/45">
              {items.length} yazı
            </span>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-white/45">Bu kategoride yazı yok.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((w) => (
                <li
                  key={w.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 sm:p-4"
                >
                  {editingId === w.id ? (
                    <EditForm
                      writing={w}
                      onSave={(p) => handleUpdate(w.id, p)}
                      onCancel={() => setEditingId(null)}
                      disabled={loading}
                    />
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/writings/${w.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 font-medium text-[#d4af37] hover:text-[#f4d03f]"
                        >
                          {w.title || "—"}
                          <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                        </Link>
                        <p className="mt-0.5 text-xs text-white/45">{formatDate(w.published_at)}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(w.id)}
                          className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
                          aria-label="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(w.id)}
                          className="rounded-lg p-2 text-white/50 transition-colors hover:bg-red-500/15 hover:text-red-400"
                          aria-label="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
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
  onSave: (p: {
    category?: string;
    title?: string;
    body?: string;
    published_at?: string;
    tefrika_issue?: string | null;
    external_url?: string | null;
  }) => void;
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
      className="w-full space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="admin-input admin-select"
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label">Tarih</label>
          <input
            type="datetime-local"
            value={published_at}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="admin-input"
          />
        </div>
      </div>
      <div>
        <label className="admin-label">Başlık</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="admin-input admin-input-lg"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">Tefrika sayısı</label>
          <input
            type="text"
            value={tefrika_issue}
            onChange={(e) => setTefrikaIssue(e.target.value)}
            placeholder="Örn. 5"
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Dergiyi satın al</label>
          <input
            type="url"
            value={external_url}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://..."
            className="admin-input"
          />
        </div>
      </div>
      <div>
        <label className="admin-label">İçerik</label>
        <RichTextEditor value={body} onChange={setBody} placeholder="Yazı içeriği…" minHeight="12rem" variant="admin" />
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="submit" disabled={disabled} className="admin-btn-gold disabled:opacity-50">
          Kaydet
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/65 transition-colors hover:border-white/20 hover:text-white"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
