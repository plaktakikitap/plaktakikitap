"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBook, updateBook } from "@/app/actions";
import { triggerPaperConfetti } from "@/lib/paperConfetti";
import type { Book, BookStatus, Visibility } from "@/types/database";
import { StarRatingInput } from "@/components/ui/StarRating";
import { AdminImageUpload } from "./AdminImageUpload";

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "to_read", label: "Okunacak" },
  { value: "reading", label: "Okunuyor" },
  { value: "finished", label: "Bitti" },
  { value: "paused", label: "Duraklatıldı" },
  { value: "dropped", label: "Bırakıldı" },
];

interface AdminReadingLogBookFormProps {
  book?: Book | null;
  defaultStatus?: BookStatus;
}

export function AdminReadingLogBookForm({ book, defaultStatus }: AdminReadingLogBookFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!book?.id;

  const [rating, setRating] = useState<number | null>(book?.rating ?? null);
  const [coverUrl, setCoverUrl] = useState(book?.cover_url ?? "");
  const [spineUrl, setSpineUrl] = useState(book?.spine_url ?? "");
  const [status, setStatus] = useState<BookStatus>(book?.status ?? defaultStatus ?? "reading");
  const [visibility, setVisibility] = useState<Visibility>(
    book?.visibility ?? (defaultStatus === "to_read" ? "private" : "public")
  );

  const showReadingFields = status !== "to_read";

  function handleStatusChange(next: BookStatus) {
    setStatus(next);
    if (next === "to_read") setVisibility("private");
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const formData = new FormData(e.currentTarget);
      formData.set("status", status);
      formData.set("visibility", visibility);
      formData.set("book_rating", rating != null && showReadingFields ? String(rating) : "");
      const markingFinished = status === "finished";
      const newlyFinished =
        markingFinished && (!isEdit || book?.status !== "finished");

      const result = isEdit
        ? await updateBook(book!.id, formData)
        : await createBook(formData);
      if (result.error) {
        setError(result.error);
        return;
      }

      if (newlyFinished) {
        const submitter = (e.nativeEvent as SubmitEvent).submitter;
        if (submitter instanceof HTMLElement) {
          triggerPaperConfetti(submitter);
        } else {
          const fallback = e.currentTarget.querySelector('button[type="submit"]');
          if (fallback instanceof HTMLElement) {
            triggerPaperConfetti(fallback);
          }
        }
      }

      router.push(status === "to_read" ? "/secretgate/okunacaklar" : "/secretgate/reading-log");
      router.refresh();
    },
    [isEdit, book, rating, router, status, visibility, showReadingFields]
  );

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">Başlık *</label>
          <input
            name="title"
            required
            defaultValue={book?.title}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Yazar *</label>
          <input
            name="author"
            required
            defaultValue={book?.author}
            className="admin-input"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">Sayfa sayısı *</label>
          <input
            name="pages"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={book?.page_count}
            placeholder="Örn. 256"
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Durum</label>
          <select
            name="status"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as BookStatus)}
            className="admin-input admin-select"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {status === "reading" && (
        <>
          <div>
            <label className="admin-label">İlerleme % (0–100)</label>
            <input
              name="progress_percent"
              type="number"
              min={0}
              max={100}
              defaultValue={book?.progress_percent ?? ""}
              placeholder="Örn. 45"
              className="admin-input max-w-[8rem]"
            />
          </div>
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="is_featured_current"
              name="is_featured_current"
              defaultChecked={book?.is_featured_current ?? false}
              className="mt-0.5 h-4 w-4 rounded border-[#e8e0d4]"
            />
            <label htmlFor="is_featured_current" className="text-sm text-[#6b6158]">
              Şu an öne çıkan — „Şu an okuyorum“ kartında bu kitabı göster. Yalnızca bir kitap
              işaretlenebilir.
            </label>
          </div>
        </>
      )}

      {showReadingFields ? (
        <>
          <div>
            <label className="admin-label">Puan (0–5)</label>
            <StarRatingInput
              name="book_rating"
              value={rating}
              onChange={setRating}
              size="md"
              className="mt-1"
            />
          </div>
        </>
      ) : null}

      <div>
        <label className="admin-label">Etiketler</label>
        <input
          name="tags"
          type="text"
          defaultValue={book?.tags?.join(", ")}
          placeholder="roman, klasik, distopya"
          className="admin-input"
        />
        <p className="admin-hint">Virgülle ayırın; # otomatik kaldırılır.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">Sırt görseli</label>
          <AdminImageUpload
            name="spine_url"
            value={spineUrl}
            onChange={setSpineUrl}
            placeholder="Sırt görseli yükle (isteğe bağlı)"
            className="mt-1"
          />
          <p className="admin-hint">Yoksa rafta kitap adı yazılı sırt görünür.</p>
        </div>
        <div>
          <label className="admin-label">Kapak görseli</label>
          <AdminImageUpload
            name="cover_url"
            value={coverUrl}
            onChange={setCoverUrl}
            placeholder="Kapak yükle"
            className="mt-1"
          />
        </div>
      </div>

      {showReadingFields ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label">Başlangıç tarihi</label>
            <input
              name="start_date"
              type="date"
              defaultValue={book?.start_date?.slice(0, 10)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Bitiş tarihi</label>
            <input
              name="end_date"
              type="date"
              defaultValue={book?.end_date?.slice(0, 10)}
              className="admin-input"
            />
          </div>
        </div>
      ) : null}

      <div>
        <label className="admin-label">Görünürlük</label>
        <select
          name="visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          disabled={status === "to_read"}
          className="admin-input admin-select disabled:opacity-70"
        >
          <option value="public">Herkes</option>
          <option value="unlisted">Gizli link</option>
          <option value="private">Sadece ben</option>
        </select>
        {status === "to_read" ? (
          <p className="admin-hint">Okunacak kitaplar kütüphanede kalır; sitede yayınlanmaz.</p>
        ) : null}
      </div>

      {showReadingFields ? (
        <div>
          <label className="admin-label">İnceleme</label>
          <textarea
            name="review"
            rows={4}
            defaultValue={book?.review ?? ""}
            className="admin-input min-h-[6rem]"
          />
        </div>
      ) : null}

      {error ? <p className="admin-error">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" className="admin-btn-gold">
          {isEdit ? "Güncelle" : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={() =>
            router.push(status === "to_read" ? "/secretgate/okunacaklar" : "/secretgate/reading-log")
          }
          className="rounded-xl border border-[#e8e0d4] px-4 py-2.5 text-sm text-[#1a1612]/65 transition-colors hover:border-[#d4c9bb] hover:text-[#1a1612]"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
