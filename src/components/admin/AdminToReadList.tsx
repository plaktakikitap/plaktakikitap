"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, BookOpen, Check } from "lucide-react";
import { deleteContent } from "@/app/actions";
import type { Book } from "@/types/database";

export function AdminToReadList({ initialBooks }: { initialBooks: Book[] }) {
  const router = useRouter();
  const [books, setBooks] = useState(initialBooks);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(id: string, newStatus: "reading" | "finished") {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        setError("Durum güncellenemedi.");
        return;
      }
      setBooks((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setLoading(true);
    try {
      const result = await deleteContent(id, "book");
      if (result.error) {
        setError(result.error);
        return;
      }
      setBooks((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    } finally {
      setLoading(false);
      setConfirmDeleteId(null);
    }
  }

  if (books.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#a09588]">
        Henüz okunacak kitap yok.{" "}
        <Link
          href="/secretgate/reading-log/new?status=to_read"
          className="text-[#b8934a] hover:underline"
        >
          Kitap ekle →
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {error ? <p className="admin-error">{error}</p> : null}
      {books.map((book) => (
        <div
          key={book.id}
          className="group flex items-center gap-3 rounded-xl border border-[#e8e0d4] bg-white/60 px-4 py-3 transition-all hover:border-[#d4c9bb]"
        >
          {book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_url}
              alt=""
              className="h-10 w-7 shrink-0 rounded object-cover shadow-sm"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#1a1612]">{book.title}</p>
            <p className="text-xs text-[#a09588]">{book.author}</p>
          </div>
          <div
            className={`flex shrink-0 items-center gap-1 transition-opacity ${
              confirmDeleteId === book.id
                ? "opacity-100"
                : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            }`}
          >
            <button
              type="button"
              disabled={loading}
              onClick={() => handleStatusChange(book.id, "reading")}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[#6b6158] transition-colors hover:bg-[#b8934a]/10 hover:text-[#b8934a] disabled:opacity-50"
              title="Şu an okuyorum olarak işaretle"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Şu an okuyorum
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleStatusChange(book.id, "finished")}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[#6b6158] transition-colors hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
              title="Okudum olarak işaretle"
            >
              <Check className="h-3.5 w-3.5" />
              Okudum
            </button>
            <Link
              href={`/secretgate/reading-log/${book.id}/edit`}
              className="rounded-lg p-1.5 text-[#6b6158] transition-colors hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
              aria-label="Düzenle"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            {confirmDeleteId === book.id ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-red-500">Emin misin?</span>
                <button
                  type="button"
                  onClick={() => handleDelete(book.id)}
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
                onClick={() => setConfirmDeleteId(book.id)}
                className="rounded-lg p-1.5 text-[#6b6158] transition-colors hover:text-red-500"
                aria-label="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
