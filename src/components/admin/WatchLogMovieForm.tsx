"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFilm } from "@/app/actions";
import { AdminImageUpload } from "./AdminImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import { StarRatingInput } from "@/components/ui/StarRating";
import { Film, Heart, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30";
const labelClass = "mb-1.5 block text-sm font-medium text-white/90";

export function WatchLogMovieForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rating5, setRating5] = useState<number | null>(null);
  const [reviewHtml, setReviewHtml] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("review", reviewHtml);

    const watchedAtRaw = (formData.get("watched_at") as string)?.trim();
    if (!watchedAtRaw) {
      setError("İzlenme tarihi zorunludur.");
      setLoading(false);
      return;
    }

    const durationMin = parseInt(String(formData.get("duration_min") || ""), 10);
    if (Number.isNaN(durationMin) || durationMin < 1) {
      setError("Süre (dakika) 1 veya daha büyük olmalıdır.");
      setLoading(false);
      return;
    }

    if (rating5 != null && (rating5 < 0 || rating5 > 5)) {
      setError("Puan 0–5 arasında olmalıdır.");
      setLoading(false);
      return;
    }

    if (rating5 != null) formData.set("rating_5", String(rating5));
    formData.set("visibility", "public");
    formData.set("genre_tags", "");

    const result = await createFilm(formData);
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
          Koleksiyona yeni bir DVD eklendi! 📀
        </p>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h3 className="mb-4 flex items-center gap-2 font-medium text-white">
          <Film className="h-5 w-5 text-amber-400" />
          Temel bilgiler
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Film adı *</label>
            <input name="title" type="text" required className={inputClass} placeholder="Örn: Dune" />
          </div>
          <div>
            <label className={labelClass}>Yönetmen</label>
            <input name="director" type="text" className={inputClass} placeholder="Yönetmen adı" />
          </div>
          <div>
            <label className={labelClass}>Süre (dakika) *</label>
            <input
              name="duration_min"
              type="number"
              required
              min={1}
              className={inputClass}
              placeholder="Örn: 155"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Yıl</label>
            <input name="year" type="number" min={1900} max={2100} className={inputClass} placeholder="Örn: 2024" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h3 className="mb-4 font-medium text-white">Görsel yönetimi (DVD estetiği)</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Ön kapak (poster)</label>
            <AdminImageUpload name="poster_url" placeholder="Poster yükle" />
          </div>
          <div>
            <label className={labelClass}>Yan kapak (spine)</label>
            <p className="mb-2 text-xs text-white/50">
              Yüklemezseniz rafta film adıyla altın/cam default görsel kullanılır.
            </p>
            <AdminImageUpload name="spine_url" placeholder="Spine yükle (isteğe bağlı)" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h3 className="mb-4 font-medium text-white">İzleme ve değerlendirme</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>İzlenme tarihi *</label>
            <input
              name="watched_at"
              type="datetime-local"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Puan (0–5)</label>
            <div className="pt-1">
              <StarRatingInput name="rating_5" value={rating5} onChange={setRating5} size="lg" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Eymen&apos;in yorumu</label>
          <input type="hidden" name="review" value={reviewHtml} readOnly aria-hidden />
          <div className="rounded-xl border border-white/20 bg-white">
            <RichTextEditor
              value={reviewHtml}
              onChange={setReviewHtml}
              placeholder="Yorumunuzu yazın…"
              minHeight="12rem"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            name="is_favorite"
            id="movie_favorite"
            className="h-4 w-4 rounded border-white/30 text-amber-500 focus:ring-amber-500/50"
          />
          <label htmlFor="movie_favorite" className="flex items-center gap-2 text-sm text-white/90">
            <Heart className="h-4 w-4 text-amber-400" />
            Favorilerime ekle
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
