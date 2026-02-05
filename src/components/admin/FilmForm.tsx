"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFilm } from "@/app/actions";
import { StarRatingInput } from "@/components/ui/StarRating";
import { X } from "lucide-react";
import styles from "@/components/watch-log/WatchLogGrid.module.css";

const SUGGESTED_GENRES = [
  "Drama",
  "Komedi",
  "Aksiyon",
  "Bilim Kurgu",
  "Korku",
  "Romantik",
  "Animasyon",
  "Gerilim",
  "Fantastik",
  "Macera",
];

export function FilmForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [rating5, setRating5] = useState<number | null>(null);
  const [genreTags, setGenreTags] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [spineUrl, setSpineUrl] = useState("");

  function addGenre(tag: string) {
    const t = tag.trim();
    if (t && !genreTags.includes(t)) setGenreTags((prev) => [...prev, t]);
  }

  function removeGenre(tag: string) {
    setGenreTags((prev) => prev.filter((g) => g !== tag));
  }

  function handleGenreKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const parts = genreInput.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
      parts.forEach(addGenre);
      setGenreInput("");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const watchedAtRaw = (formData.get("watched_at") as string)?.trim();
    if (!watchedAtRaw) {
      setError("İzlenme tarihi (watched_at) zorunludur.");
      return;
    }

    const durationMin = formData.get("duration_min");
    const durationNum = durationMin != null ? parseInt(String(durationMin), 10) : NaN;
    if (Number.isNaN(durationNum) || durationNum < 1) {
      setError("Süre (dk) 1 veya daha büyük olmalıdır.");
      return;
    }

    const ratingRaw = formData.get("rating_5") as string | null;
    if (ratingRaw && ratingRaw !== "") {
      const r = parseFloat(ratingRaw);
      if (Number.isNaN(r) || r < 0 || r > 5) {
        setError("Puan 0 ile 5 arasında olmalıdır.");
        return;
      }
    }

    formData.set("genre_tags", genreTags.join(", "));

    const result = await createFilm(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/films");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium">Başlık *</label>
        <input
          name="title"
          required
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Yönetmen</label>
        <input
          name="director"
          placeholder="Yönetmen adı"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">İzlenme tarihi (watched_at) *</label>
        <input
          name="watched_at"
          type="datetime-local"
          required
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
        <p className="mt-0.5 text-xs text-[var(--muted)]">Raf sırası ve &quot;Son izlediğim&quot; buna göre belirlenir.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Süre (dk) *</label>
          <input
            name="duration_min"
            type="number"
            required
            min={1}
            step={1}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
          <p className="mt-0.5 text-xs text-[var(--muted)]">Pozitif tam sayı.</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Puan (0–5, 0.25 adım)</label>
          <div className="mt-1">
            <StarRatingInput
              name="rating_5"
              value={rating5}
              onChange={setRating5}
              size="lg"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Türler (genre_tags)</label>
        <input type="hidden" name="genre_tags" value={genreTags.join(", ")} readOnly aria-hidden />
        <div className="mt-1 flex flex-wrap gap-1.5">
          {SUGGESTED_GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => addGenre(g)}
              className={`rounded-full px-2.5 py-1 text-xs transition ${
                genreTags.includes(g)
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--muted)]/50 text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={genreInput}
          onChange={(e) => setGenreInput(e.target.value)}
          onKeyDown={handleGenreKeyDown}
          onBlur={() => {
            genreInput.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean).forEach(addGenre);
            setGenreInput("");
          }}
          placeholder="Yazıp Enter veya virgül ile ekleyin"
          className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
        {genreTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {genreTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/20 px-2.5 py-1 text-xs text-[var(--foreground)]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeGenre(tag)}
                  className="rounded p-0.5 hover:bg-black/20"
                  aria-label={`${tag} kaldır`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Kapak görseli (cover) URL</label>
          <input
            name="poster_url"
            type="url"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
          <p className="mt-1.5 text-xs text-[var(--muted)]">Modal önizleme (2:3 oran)</p>
          <div className="mt-2 aspect-[2/3] w-full max-w-[180px] overflow-hidden rounded-lg border border-[var(--card-border)] bg-black/20">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt=""
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted)]">
                Kapak yok
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Spine görseli (DVD yan yüz) URL</label>
          <input
            name="spine_url"
            type="url"
            value={spineUrl}
            onChange={(e) => setSpineUrl(e.target.value)}
            placeholder="https://... (rafta görünür)"
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
          <p className="mt-1.5 text-xs text-[var(--muted)]">Raf önizleme (raf oranı)</p>
          <div className="mt-2 flex justify-start">
            <div
              className={styles.spineCard}
              style={{ width: 60, height: 300, minWidth: 60, minHeight: 300 }}
            >
              <div className={styles.spineCardInner}>
                {spineUrl ? (
                  <img
                    src={spineUrl}
                    alt=""
                    className={styles.spineImage}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className={styles.spinePlaceholder}>
                    <span className="text-[10px]">Spine</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">İnceleme (review_text)</label>
        <textarea
          name="review"
          rows={4}
          placeholder="İnceleme metni"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input
            name="slug"
            placeholder="url-friendly-baslik"
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
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
      </div>
      <div>
        <label className="block text-sm font-medium">Açıklama</label>
        <textarea
          name="description"
          rows={2}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Yıl</label>
        <input
          name="year"
          type="number"
          min={1900}
          max={2100}
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
