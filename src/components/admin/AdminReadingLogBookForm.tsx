"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBook, updateBook } from "@/app/actions";
import type { Book } from "@/types/database";
import { StarRatingInput } from "@/components/ui/StarRating";
import { BookOpen } from "lucide-react";

/** Spine preview: shelf proportions (narrow vertical) */
const SPINE_PREVIEW_WIDTH = 56;
const SPINE_PREVIEW_HEIGHT = 280;

interface AdminReadingLogBookFormProps {
  book?: Book | null;
}

export function AdminReadingLogBookForm({ book }: AdminReadingLogBookFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!book?.id;

  const [rating, setRating] = useState<number | null>(book?.rating ?? null);
  const [coverUrl, setCoverUrl] = useState(book?.cover_url ?? "");
  const [spineUrl, setSpineUrl] = useState(book?.spine_url ?? "");
  const [status, setStatus] = useState(book?.status ?? "reading");

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const formData = new FormData(e.currentTarget);
      formData.set("book_rating", rating != null ? String(rating) : "");
      const result = isEdit
        ? await updateBook(book!.id, formData)
        : await createBook(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/reading-log");
      router.refresh();
    },
    [isEdit, book, rating, router]
  );

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Başlık *</label>
          <input
            name="title"
            required
            defaultValue={book?.title}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Yazar *</label>
          <input
            name="author"
            required
            defaultValue={book?.author}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Sayfa sayısı (page_count) *</label>
          <input
            name="pages"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={book?.page_count}
            placeholder="Örn. 256"
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Durum (status)</label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Book["status"])}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          >
            <option value="reading">Okunuyor</option>
            <option value="finished">Bitti</option>
            <option value="paused">Duraklatıldı</option>
            <option value="dropped">Bırakıldı</option>
          </select>
        </div>
      </div>

      {status === "reading" && (
        <>
          <div>
            <label className="block text-sm font-medium">İlerleme % (0-100)</label>
            <input
              name="progress_percent"
              type="number"
              min={0}
              max={100}
              defaultValue={book?.progress_percent ?? ""}
              placeholder="Örn. 45"
              className="mt-1 w-full max-w-[8rem] rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_featured_current"
              name="is_featured_current"
              defaultChecked={book?.is_featured_current ?? false}
              className="h-4 w-4 rounded border-[var(--card-border)]"
            />
            <label htmlFor="is_featured_current" className="text-sm">
              Şu an öne çıkan („Şu an okuyorum“ kartında bu kitabı göster). Yalnızca bir kitap işaretlenebilir.
            </label>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium">Puan (0-5, 0.25 adım)</label>
        <StarRatingInput
          name="book_rating"
          value={rating}
          onChange={setRating}
          size="md"
          className="mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Etiketler (virgülle ayırın; # otomatik kaldırılır)</label>
        <input
          name="tags"
          type="text"
          defaultValue={book?.tags?.join(", ")}
          placeholder="roman, klasik, distopya"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Sırt görseli URL (spine_url) *</label>
          <input
            name="spine_url"
            type="url"
            required
            value={spineUrl}
            onChange={(e) => setSpineUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">Raf oranında önizleme:</p>
          <div
            className="mt-1 overflow-hidden rounded border border-[var(--card-border)] bg-[var(--card)]"
            style={{ width: SPINE_PREVIEW_WIDTH, height: SPINE_PREVIEW_HEIGHT }}
          >
            {spineUrl ? (
              <img
                src={spineUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setSpineUrl("")}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                <BookOpen className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Kapak görseli URL (cover_url)</label>
          <input
            name="cover_url"
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">2:3 oran önizleme:</p>
          <div className="mt-1 aspect-[2/3] w-24 overflow-hidden rounded border border-[var(--card-border)] bg-[var(--card)]">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setCoverUrl("")}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                <BookOpen className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Başlangıç tarihi (start_date)</label>
          <input
            name="start_date"
            type="date"
            defaultValue={book?.start_date?.slice(0, 10)}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Bitiş tarihi (end_date)</label>
          <input
            name="end_date"
            type="date"
            defaultValue={book?.end_date?.slice(0, 10)}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Görünürlük</label>
        <select
          name="visibility"
          defaultValue={book?.visibility ?? "public"}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        >
          <option value="public">Herkes</option>
          <option value="unlisted">Gizli link</option>
          <option value="private">Sadece ben</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">İnceleme (review)</label>
        <textarea
          name="review"
          rows={4}
          defaultValue={book?.review ?? ""}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {isEdit ? "Güncelle" : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/reading-log")}
          className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
