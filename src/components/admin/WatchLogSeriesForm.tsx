"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSeries } from "@/app/actions";
import { AdminImageUpload } from "./AdminImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import { StarRatingInput } from "@/components/ui/StarRating";
import { Tv, Heart, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-[#d4c9bb] bg-[#1a1612]/5 px-4 py-3 text-sm text-[#1a1612] placeholder:text-[#6b6158] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30";
const labelClass = "mb-1.5 block text-sm font-medium text-[#1a1612]";

const GENRES = [
  "Dram",
  "Komedi",
  "Gerilim",
  "Belgesel",
  "Animasyon",
  "Korku",
  "Bilim Kurgu",
  "Romantik",
  "Aksiyon",
  "Diğer",
] as const;

export function WatchLogSeriesForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rating5, setRating5] = useState<number | null>(null);
  const [reviewHtml, setReviewHtml] = useState("");
  const [success, setSuccess] = useState(false);
  const [posterUrl, setPosterUrl] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [published, setPublished] = useState(true);

  function toggleGenre(g: string) {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("review", reviewHtml);
    formData.set("poster_url", posterUrl);
    formData.set("genre_tags", genres.join(","));
    formData.set("visibility", published ? "public" : "private");

    const episodesWatched = parseInt(String(formData.get("episodes_watched") || "0"), 10);
    if (Number.isNaN(episodesWatched) || episodesWatched < 0) {
      setError("Toplam bölüm sayısı 0 veya daha büyük olmalıdır.");
      setLoading(false);
      return;
    }

    if (rating5 != null && (rating5 < 0 || rating5 > 5)) {
      setError("Puan 0–5 arasında olmalıdır.");
      setLoading(false);
      return;
    }

    if (rating5 != null) {
      formData.set("rating_5", String(rating5));
      formData.set("rating", String(rating5 * 2));
    }

    const result = await createSeries(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    router.refresh();
    form.reset();
    setRating5(null);
    setReviewHtml("");
    setPosterUrl("");
    setGenres([]);
    setPublished(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Dizi eklendi ✓
        </p>
      )}

      <div className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-6 backdrop-blur-sm">
        <h3 className="mb-4 flex items-center gap-2 font-medium text-[#1a1612]">
          <Tv className="h-5 w-5 text-[#b8934a]" />
          Temel bilgiler
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Dizi adı *</label>
            <input name="title" type="text" required className={inputClass} placeholder="Örn: Severance" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Yaratıcı / yönetmen</label>
            <input name="creator_or_director" type="text" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Yapım yılı</label>
            <input name="year" type="number" min={1900} max={2100} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Sezon sayısı</label>
            <input name="total_seasons" type="number" min={0} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Toplam bölüm sayısı</label>
            <input name="episodes_watched" type="number" min={0} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Bölüm başı ortalama dakika</label>
            <input name="avg_episode_min" type="number" min={1} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>İzlenen sezon sayısı</label>
            <input name="seasons_watched" type="number" min={0} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Tür</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const on = genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      on
                        ? "bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/40"
                        : "bg-[#1a1612]/5 text-[#6b6158] hover:bg-[#1a1612]/8"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-6 backdrop-blur-sm">
        <h3 className="mb-4 font-medium text-[#1a1612]">Afiş</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Afiş URL</label>
            <input
              type="url"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value.trim())}
              className={inputClass}
              placeholder="https://…"
            />
          </div>
          <div>
            <label className={labelClass}>veya dosya yükle</label>
            <AdminImageUpload
              name="poster_url"
              value={posterUrl}
              onChange={setPosterUrl}
              placeholder="Poster yükle"
            />
          </div>
          <div>
            <label className={labelClass}>Spine (opsiyonel)</label>
            <AdminImageUpload name="spine_url" placeholder="Spine yükle" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-6 backdrop-blur-sm">
        <h3 className="mb-4 font-medium text-[#1a1612]">İzleme ve değerlendirme</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>İzlenme tarihi *</label>
            <input name="watched_at" type="datetime-local" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Durum</label>
            <select name="status" className={inputClass} defaultValue="">
              <option value="">Seçin</option>
              <option value="finished">Bitirilmiş</option>
              <option value="waiting">Devamını Bekliyorum</option>
              <option value="dropped">Yarıda Bıraktım</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Puan (0–5, 0.5 adım)</label>
            <div className="pt-1">
              <StarRatingInput name="rating_5" value={rating5} onChange={setRating5} size="lg" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Kısa yorum</label>
          <input type="hidden" name="review" value={reviewHtml} readOnly aria-hidden />
          <div className="rounded-xl border border-[#d4c9bb] bg-white">
            <RichTextEditor
              value={reviewHtml}
              onChange={setReviewHtml}
              placeholder="Yorumunuzu yazın…"
              minHeight="10rem"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-[#1a1612]">
            <input
              type="checkbox"
              name="is_favorite"
              id="series_favorite"
              className="h-4 w-4 rounded border-[#d4c9bb] text-amber-500"
            />
            <Heart className="h-4 w-4 text-[#b8934a]" />
            Favorilerime ekle
          </label>
          <label className="flex items-center gap-2 text-sm text-[#1a1612]">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-[#d4c9bb] text-amber-500"
            />
            Yayında
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-medium text-[#1a1612] transition hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
