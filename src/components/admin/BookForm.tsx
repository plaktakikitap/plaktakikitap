"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBook } from "@/app/actions";
import { AdminImageUpload } from "./AdminImageUpload";

type OpenLibraryDoc = { cover_i?: number; title?: string; isbn?: string[] };

function openLibraryCoverUrl(doc: OpenLibraryDoc | null): string | null {
  if (!doc) return null;
  if (doc.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
  const isbn = doc.isbn?.[0];
  if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  return null;
}

function pickOpenLibraryCover(docs: OpenLibraryDoc[], title: string) {
  const wanted = title.trim().toLocaleLowerCase("tr");
  const nameOf = (doc: OpenLibraryDoc) => (doc.title ?? "").trim().toLocaleLowerCase("tr");
  const exact = docs.filter((doc) => nameOf(doc) === wanted);
  const close = docs.filter((doc) => {
    const name = nameOf(doc);
    return name.startsWith(wanted) && !name.includes("adaptation");
  });

  for (const pool of [exact, close, docs]) {
    const withId = pool.find((doc) => doc.cover_i);
    if (withId) return withId;
  }
  for (const pool of [exact, close, docs]) {
    const withIsbn = pool.find((doc) => doc.isbn?.[0]);
    if (withIsbn) return withIsbn;
  }
  return null;
}

export function BookForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverNote, setCoverNote] = useState<string | null>(null);
  const [coverBroken, setCoverBroken] = useState(false);

  function applyCover(url: string) {
    setCoverUrl(url);
    setCoverBroken(false);
  }

  async function findCover() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setCoverNote("Önce başlık yaz.");
      return;
    }

    setCoverBusy(true);
    setCoverNote(null);
    try {
      const params = new URLSearchParams({
        title: trimmedTitle,
        limit: "8",
        fields: "cover_i,isbn,title",
      });
      const trimmedAuthor = author.trim();
      if (trimmedAuthor) params.set("author", trimmedAuthor);
      const res = await fetch(`https://openlibrary.org/search.json?${params}`);
      if (!res.ok) throw new Error("yanıt yok");
      const data = (await res.json()) as { docs?: OpenLibraryDoc[] };
      const doc = pickOpenLibraryCover(data.docs ?? [], trimmedTitle);
      const url = openLibraryCoverUrl(doc);
      if (!url) {
        setCoverNote("Kapak bulunamadı — adresi elle girebilirsin.");
        return;
      }
      applyCover(url);
      setCoverNote(doc?.title ? `Bulundu: ${doc.title}` : "Kapak bulundu.");
    } catch {
      setCoverNote("Open Library’ye ulaşılamadı.");
    } finally {
      setCoverBusy(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createBook(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/secretgate/books");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium">Başlık *</label>
        <input
          name="title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Yazar</label>
        <input
          name="author"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Slug</label>
        <input
          name="slug"
          placeholder="url-friendly-baslik"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Açıklama</label>
        <textarea
          name="description"
          rows={3}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Sayfa Sayısı *</label>
          <input
            name="pages"
            type="number"
            min={1}
            step={1}
            required
            placeholder="Örn. 256"
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Durum (status)</label>
          <select
            name="status"
            defaultValue="reading"
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          >
            <option value="to_read">Okunacak</option>
            <option value="reading">Okunuyor</option>
            <option value="finished">Bitti</option>
            <option value="paused">Duraklatıldı</option>
            <option value="dropped">Bırakıldı</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">İlerleme % (0-100, okunuyorsa)</label>
          <input
            name="progress_percent"
            type="number"
            min={0}
            max={100}
            placeholder="Örn. 45"
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Kitap puanı (0-5)</label>
          <input
            name="book_rating"
            type="number"
            step="0.25"
            min={0}
            max={5}
            placeholder="0–5"
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Görünürlük</label>
        <select
          name="visibility"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        >
          <option value="public">Herkes</option>
          <option value="unlisted">Gizli link</option>
          <option value="private">Sadece ben</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Kapak görseli</label>
          <div className="mt-1 flex gap-2">
            <input
              name="cover_url"
              value={coverUrl}
              onChange={(event) => applyCover(event.target.value)}
              placeholder="https://... veya otomatik bul"
              className="min-w-0 flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
            />
            <button
              type="button"
              onClick={findCover}
              disabled={coverBusy}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm hover:bg-[var(--background)] disabled:opacity-50"
            >
              {coverBusy ? "Aranıyor…" : "Otomatik bul"}
            </button>
          </div>
          {coverUrl && !coverBroken ? (
            <div className="mt-2 flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt="Kapak önizleme"
                className="h-24 w-auto rounded-md border border-[var(--card-border)] object-cover shadow-sm"
                onLoad={(event) => {
                  const img = event.currentTarget;
                  if (img.naturalWidth <= 1 || img.naturalHeight <= 1) setCoverBroken(true);
                }}
                onError={() => setCoverBroken(true)}
              />
              <p className="mt-1 text-xs text-[var(--muted)]">
                Önizleme — kaydetmek için formu gönder
              </p>
            </div>
          ) : null}
          {coverNote ? <p className="mt-1 text-xs text-[var(--muted)]">{coverNote}</p> : null}
          <AdminImageUpload
            name="cover_url"
            value={coverUrl}
            onChange={applyCover}
            submit={false}
            placeholder="Ya da dosya yükle"
            className="mt-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Sırt görseli (kitaplık) *</label>
          <AdminImageUpload
            name="spine_url"
            placeholder="Sırt görseli yükle"
            className="mt-1"
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Başlangıç tarihi (start_date)</label>
          <input
            name="start_date"
            type="date"
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Bitiş tarihi (end_date)</label>
          <input
            name="end_date"
            type="date"
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Etiketler (#etiketler)</label>
        <input
          name="tags"
          type="text"
          placeholder="roman, klasik, distopya (virgülle ayırın)"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Alıntı</label>
        <textarea
          name="quote"
          rows={2}
          placeholder="Beğendiğiniz bir alıntı"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">İnceleme</label>
        <textarea
          name="review"
          rows={4}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Kaydet
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
