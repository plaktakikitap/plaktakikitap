"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Quote as QuoteIcon, Trash2 } from "lucide-react";
import type { Quote } from "@/lib/quotes";

interface AdminBookQuotesProps {
  bookId: string;
}

export function AdminBookQuotes({ bookId }: AdminBookQuotesProps) {
  const [items, setItems] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/quotes?book_id=${encodeURIComponent(bookId)}`);
      if (!res.ok) throw new Error("Yüklenemedi");
      const data = (await res.json()) as Quote[];
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError("Alıntılar yüklenemedi");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: bookId,
          text: text.trim(),
          page_number: pageNumber.trim() ? Number(pageNumber) : null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.error === "string" ? body.error : "Eklenemedi"
        );
      }
      const created = (await res.json()) as Quote;
      setItems((prev) => [created, ...prev]);
      setText("");
      setPageNumber("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eklenemedi");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu alıntıyı silmek istiyor musun?")) return;
    const res = await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Silinemedi");
      return;
    }
    setItems((prev) => prev.filter((q) => q.id !== id));
  }

  return (
    <section className="mt-10 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1a1612]">
          <QuoteIcon className="h-4 w-4 text-[var(--accent)]" aria-hidden />
          Alıntılar
          <span className="font-normal text-[#1a1612]/40">({items.length})</span>
        </h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Alıntı ekle
        </button>
      </div>

      {open ? (
        <form onSubmit={handleAdd} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[#6b6158]">Alıntı metni</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              required
              placeholder="Kitaptan bir cümle…"
              className="w-full rounded-lg border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2 text-sm text-[#1a1612] placeholder:text-[#6b6158] focus:border-[var(--accent)]/50 focus:outline-none"
            />
          </div>
          <div className="max-w-[140px]">
            <label className="mb-1 block text-xs text-[#6b6158]">
              Sayfa (opsiyonel)
            </label>
            <input
              type="number"
              min={1}
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              placeholder="örn. 42"
              className="w-full rounded-lg border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2 text-sm text-[#1a1612] placeholder:text-[#6b6158] focus:border-[var(--accent)]/50 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !text.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : null}
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-[#e8e0d4] px-3 py-1.5 text-xs text-[#1a1612]/70 hover:bg-[#1a1612]/5"
            >
              Vazgeç
            </button>
          </div>
        </form>
      ) : null}

      {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}

      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-xs text-[#1a1612]/40">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Yükleniyor…
        </p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-xs text-[#1a1612]/40">Henüz alıntı yok.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((q) => (
            <li
              key={q.id}
              className="flex gap-3 rounded-lg border border-[#e8e0d4] bg-[#f0ebe2] px-3 py-2.5"
            >
              <p className="min-w-0 flex-1 text-sm leading-relaxed text-[#1a1612]/85">
                <span className="text-[#1a1612]/40">“</span>
                {q.text}
                <span className="text-[#1a1612]/40">”</span>
                {q.page_number != null ? (
                  <span className="ml-2 text-xs text-[#1a1612]/40">
                    s. {q.page_number}
                  </span>
                ) : null}
              </p>
              <button
                type="button"
                onClick={() => void handleDelete(q.id)}
                className="shrink-0 rounded p-1.5 text-[#1a1612]/40 hover:bg-[#1a1612]/5 hover:text-red-300"
                aria-label="Alıntıyı sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
