"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
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
      setConfirmDeleteId(null);
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
            <span className="rounded-full bg-[#1a1612]/5 px-2.5 py-0.5 text-xs text-[#1a1612]/40">
              {items.length} yazı
            </span>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-[#1a1612]/40">Bu kategoride yazı yok.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((w) => (
                <li key={w.id}>
                  {editingId === w.id ? (
                    <div className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 p-3 sm:p-4">
                      <EditForm
                        writing={w}
                        onSave={(p) => handleUpdate(w.id, p)}
                        onCancel={() => setEditingId(null)}
                        disabled={loading}
                      />
                    </div>
                  ) : (
                    <div className="group flex items-center gap-3 rounded-xl border border-[#e8e0d4] bg-white/60 px-4 py-3 transition-all hover:border-[#d4c9bb]">
                      <div className="min-w-0 flex-1">
                        <a
                          href={`/writings/${w.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 truncate text-sm font-medium text-[#1a1612] hover:text-[#b8934a]"
                        >
                          {w.title || "—"}
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                        </a>
                        <p className="mt-0.5 text-xs text-[#a09588]">
                          {formatDate(w.published_at)}
                          {w.tefrika_issue ? (
                            <span className="ml-2 rounded-full bg-[#b8934a]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#b8934a]">
                              Tefrika #{w.tefrika_issue}
                            </span>
                          ) : null}
                        </p>
                      </div>

                      <div
                        className={`flex shrink-0 items-center gap-1 transition-opacity ${
                          confirmDeleteId === w.id
                            ? "opacity-100"
                            : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setEditingId(w.id)}
                          className="rounded-lg p-1.5 text-[#6b6158] transition-colors hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
                          aria-label="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {confirmDeleteId === w.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-red-500">Emin misin?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(w.id)}
                              disabled={loading}
                              className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-[#faf7f2] hover:bg-red-600 disabled:opacity-50"
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
                            onClick={() => setConfirmDeleteId(w.id)}
                            className="rounded-lg p-1.5 text-[#6b6158] transition-colors hover:text-red-500"
                            aria-label="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
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
          className="rounded-xl border border-[#e8e0d4] px-4 py-2.5 text-sm text-[#1a1612]/65 transition-colors hover:border-[#d4c9bb] hover:text-[#1a1612]"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
