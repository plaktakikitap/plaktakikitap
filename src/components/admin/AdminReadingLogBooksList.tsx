"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteContent } from "@/app/actions";
import type { Book, BookStatus } from "@/types/database";

const STATUS_LABELS: Record<BookStatus, string> = {
  to_read: "Okunacak",
  reading: "Okunuyor",
  finished: "Bitti",
  paused: "Duraklatıldı",
  dropped: "Bırakıldı",
};

export function AdminReadingLogBooksList({ initialBooks }: { initialBooks: Book[] }) {
  const router = useRouter();
  const [books, setBooks] = useState(initialBooks);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    return <p className="py-6 text-center text-sm text-[#1a1612]/40">Henüz kitap yok.</p>;
  }

  return (
    <div className="space-y-2">
      {error ? <p className="admin-error">{error}</p> : null}
      <ul className="space-y-2">
        {books.map((book) => (
          <li key={book.id}>
            <div className="group flex items-center gap-3 rounded-xl border border-[#e8e0d4] bg-white/60 px-4 py-3 transition-all hover:border-[#d4c9bb]">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-medium text-[#1a1612]">{book.title}</p>
                  {book.is_featured_current ? (
                    <span className="shrink-0 rounded-full bg-[#b8934a]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#b8934a]">
                      Öne çıkan
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-xs text-[#a09588]">
                  {book.author ? `${book.author} · ` : ""}
                  {STATUS_LABELS[book.status] ?? book.status}
                  {book.page_count ? ` · ${book.page_count} sayfa` : ""}
                </p>
              </div>

              <div
                className={`flex shrink-0 items-center gap-1 transition-opacity ${
                  confirmDeleteId === book.id
                    ? "opacity-100"
                    : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                }`}
              >
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
          </li>
        ))}
      </ul>
    </div>
  );
}
