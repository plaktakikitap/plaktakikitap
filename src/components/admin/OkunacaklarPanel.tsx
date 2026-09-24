"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Check, Pencil, Trash2, BookMarked } from "lucide-react";
import { deleteContent } from "@/app/actions";
import type { Book } from "@/types/database";

export function OkunacaklarPanel({
  initialToRead,
  initialNowReading,
}: {
  initialToRead: Book[];
  initialNowReading: Book[];
}) {
  const router = useRouter();
  const [toRead, setToRead] = useState(initialToRead);
  const [nowReading, setNowReading] = useState(initialNowReading);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function patchBook(id: string, payload: Record<string, unknown>) {
    const res = await fetch(`/api/admin/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as Book;
  }

  async function handleStartReading(book: Book) {
    setError(null);
    setLoadingId(book.id);
    try {
      const updated = await patchBook(book.id, { status: "reading" });
      if (!updated) {
        setError("Durum güncellenemedi.");
        return;
      }
      setToRead((prev) => prev.filter((b) => b.id !== book.id));
      setNowReading((prev) => [updated, ...prev.filter((b) => b.id !== book.id)]);
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  async function handleFinished(id: string) {
    setError(null);
    setLoadingId(id);
    try {
      const updated = await patchBook(id, { status: "finished" });
      if (!updated) {
        setError("Durum güncellenemedi.");
        return;
      }
      setToRead((prev) => prev.filter((b) => b.id !== id));
      setNowReading((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  async function handleSaveProgress(id: string, progress: number, note: string) {
    setError(null);
    setLoadingId(id);
    try {
      const updated = await patchBook(id, {
        progress_percent: progress,
        review: note,
      });
      if (!updated) {
        setError("İlerleme kaydedilemedi.");
        return;
      }
      setNowReading((prev) => prev.map((b) => (b.id === id ? updated : b)));
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setLoadingId(id);
    try {
      const result = await deleteContent(id, "book");
      if (result.error) {
        setError(result.error);
        return;
      }
      setToRead((prev) => prev.filter((b) => b.id !== id));
      setNowReading((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    } finally {
      setLoadingId(null);
      setConfirmDeleteId(null);
    }
  }

  const isEmpty = toRead.length === 0 && nowReading.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="rounded-2xl border border-[#e8e0d4] bg-[#faf7f2] p-6">
          <BookMarked className="mx-auto h-10 w-10 text-[#b8934a]/50" />
        </div>
        <p className="text-sm text-[#6b6158]">Kütüphaneniz boş.</p>
        <Link
          href="/secretgate/reading-log/new?status=to_read"
          className="rounded-xl border border-[#e8e0d4] bg-[#faf7f2] px-4 py-2 text-sm font-medium text-[#1a1612] transition-colors hover:border-[#b8934a]/30 hover:bg-[#b8934a]/5"
        >
          İlk kitabı ekle →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error ? <p className="admin-error">{error}</p> : null}

      {nowReading.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#1a1612]/40">
            Şu an okuyorum
          </h2>
          <div className="space-y-3">
            {nowReading.map((book) => (
              <NowReadingCard
                key={book.id}
                book={book}
                loading={loadingId === book.id}
                confirmDelete={confirmDeleteId === book.id}
                onSaveProgress={(progress, note) =>
                  handleSaveProgress(book.id, progress, note)
                }
                onFinished={() => handleFinished(book.id)}
                onAskDelete={() => setConfirmDeleteId(book.id)}
                onCancelDelete={() => setConfirmDeleteId(null)}
                onDelete={() => handleDelete(book.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#1a1612]/40">
          Okuyacaklarım
        </h2>
        {toRead.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#e8e0d4] px-4 py-8 text-center text-sm text-[#a09588]">
            Bekleyen kitap yok.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {toRead.map((book) => (
              <div
                key={book.id}
                className="group relative flex gap-3 rounded-2xl border border-[#e8e0d4] bg-white/70 p-4 transition-all hover:border-[#d4c9bb] hover:shadow-sm"
              >
                <div className="shrink-0">
                  {book.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="h-20 w-14 rounded-lg object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex h-20 w-14 items-center justify-center rounded-lg bg-[#b8934a]/10">
                      <BookMarked className="h-6 w-6 text-[#b8934a]/50" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 pr-8">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#1a1612]">
                    {book.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6b6158]">{book.author}</p>
                  {book.page_count ? (
                    <p className="mt-1 text-[10px] text-[#a09588]">
                      {book.page_count} sayfa
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      disabled={loadingId === book.id}
                      onClick={() => handleStartReading(book)}
                      className="flex items-center gap-1 rounded-lg border border-[#b8934a]/30 bg-[#b8934a]/8 px-2.5 py-1 text-xs font-medium text-[#b8934a] transition-colors hover:bg-[#b8934a]/15 disabled:opacity-50"
                    >
                      <BookOpen className="h-3 w-3" />
                      Şu an okuyorum
                    </button>
                    <button
                      type="button"
                      disabled={loadingId === book.id}
                      onClick={() => handleFinished(book.id)}
                      className="flex items-center gap-1 rounded-lg border border-[#e8e0d4] px-2.5 py-1 text-xs text-[#6b6158] transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                    >
                      <Check className="h-3 w-3" />
                      Okudum
                    </button>
                  </div>
                </div>

                <div
                  className={`absolute right-3 top-3 flex items-center gap-1 transition-opacity ${
                    confirmDeleteId === book.id
                      ? "opacity-100"
                      : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  }`}
                >
                  <Link
                    href={`/secretgate/reading-log/${book.id}/edit`}
                    className="rounded-lg p-1 text-[#6b6158] transition-colors hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  {confirmDeleteId === book.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(book.id)}
                        disabled={loadingId === book.id}
                        className="rounded-lg bg-red-500 px-2 py-0.5 text-xs text-[#faf7f2] hover:bg-red-600 disabled:opacity-50"
                      >
                        Sil
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-[#e8e0d4] px-2 py-0.5 text-xs text-[#6b6158]"
                      >
                        İptal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(book.id)}
                      className="rounded-lg p-1 text-[#6b6158] transition-colors hover:text-red-500"
                      aria-label="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function NowReadingCard({
  book,
  loading,
  confirmDelete,
  onSaveProgress,
  onFinished,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  book: Book;
  loading: boolean;
  confirmDelete: boolean;
  onSaveProgress: (progress: number, note: string) => void;
  onFinished: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const [progress, setProgress] = useState(
    book.progress_percent == null ? "" : String(book.progress_percent)
  );
  const [note, setNote] = useState(book.review ?? "");

  return (
    <div className="group relative rounded-2xl border border-[#b8934a]/25 bg-[#b8934a]/6 p-4">
      <div className="flex gap-3">
        <div className="shrink-0">
          {book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_url}
              alt={book.title}
              className="h-24 w-16 rounded-lg object-cover shadow-md"
            />
          ) : (
            <div className="flex h-24 w-16 items-center justify-center rounded-lg bg-[#b8934a]/10">
              <BookOpen className="h-6 w-6 text-[#b8934a]/50" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 pr-8">
          <p className="text-sm font-semibold leading-snug text-[#1a1612]">
            {book.title}
          </p>
          <p className="mt-0.5 text-xs text-[#6b6158]">{book.author}</p>
          {book.is_featured_current ? (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#b8934a]">
              Sitede görünüyor
            </p>
          ) : null}

          <label className="mt-3 block text-[10px] font-medium uppercase tracking-[0.12em] text-[#1a1612]/40">
            İlerleme (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            placeholder="0–100"
            className="mt-1 w-full rounded-lg border border-[#e8e0d4] bg-[#faf7f2] px-3 py-2 text-sm text-[#1a1612]"
          />

          <label className="mt-3 block text-[10px] font-medium uppercase tracking-[0.12em] text-[#1a1612]/40">
            Not (isteğe bağlı)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Kısa not..."
            className="mt-1 w-full rounded-lg border border-[#e8e0d4] bg-[#faf7f2] px-3 py-2 text-sm text-[#1a1612]"
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                const n = progress.trim() === "" ? 0 : Number(progress);
                onSaveProgress(
                  Number.isNaN(n) ? 0 : Math.max(0, Math.min(100, Math.round(n))),
                  note
                );
              }}
              className="rounded-lg bg-[#b8934a] px-3 py-1.5 text-xs font-medium text-[#faf7f2] transition-colors hover:bg-[#a07f3e] disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onFinished}
              className="flex items-center gap-1 rounded-lg border border-[#e8e0d4] bg-[#faf7f2] px-2.5 py-1.5 text-xs text-[#6b6158] transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
            >
              <Check className="h-3 w-3" />
              Okudum
            </button>
          </div>
        </div>
      </div>

      <div
        className={`absolute right-3 top-3 flex items-center gap-1 transition-opacity ${
          confirmDelete
            ? "opacity-100"
            : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        }`}
      >
        <Link
          href={`/secretgate/reading-log/${book.id}/edit`}
          className="rounded-lg p-1 text-[#6b6158] transition-colors hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
          aria-label="Düzenle"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onDelete}
              disabled={loading}
              className="rounded-lg bg-red-500 px-2 py-0.5 text-xs text-[#faf7f2] hover:bg-red-600 disabled:opacity-50"
            >
              Sil
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              className="rounded-lg border border-[#e8e0d4] px-2 py-0.5 text-xs text-[#6b6158]"
            >
              İptal
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAskDelete}
            className="rounded-lg p-1 text-[#6b6158] transition-colors hover:text-red-500"
            aria-label="Sil"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
