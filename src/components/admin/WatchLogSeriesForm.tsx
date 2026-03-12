"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSeries } from "@/app/actions";
import { AdminImageUpload } from "./AdminImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import { StarRatingInput } from "@/components/ui/StarRating";
import { Tv, Heart, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30";
const labelClass = "mb-1.5 block text-sm font-medium text-white/90";

export function WatchLogSeriesForm() {
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

    if (rating5 != null) formData.set("rating_5", String(rating5));
    formData.set("visibility", "public");
    formData.set("rating", rating5 != null ? String(rating5 * 2) : "");

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
          <Tv className="h-5 w-5 text-amber-400" />
          Temel bilgiler
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Dizi adı *</label>
            <input name="title" type="text" required className={inputClass} placeholder="Örn: Severance" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Yaratıcı / yönetmen</label>
            <input name="creator_or_director" type="text" className={inputClass} placeholder="Dizi yaratıcısı veya yönetmeni" />
          </div>
          <div>
            <label className={labelClass}>Sezon sayısı</label>
            <input
              name="total_seasons"
              type="number"
              min={0}
              className={inputClass}
              placeholder="Toplam sezon"
            />
          </div>
          <div>
            <label className={labelClass}>Toplam bölüm sayısı</label>
            <input
              name="episodes_watched"
              type="number"
              min={0}
              className={inputClass}
              placeholder="İzlenen bölüm sayısı"
            />
          </div>
          <div>
            <label className={labelClass}>Bölüm başı ortalama dakika</label>
            <input
              name="avg_episode_min"
              type="number"
              min={1}
              className={inputClass}
              placeholder="Örn: 45"
            />
            <p className="mt-1 text-xs text-white/50">Toplam izleme süresi otomatik hesaplanır.</p>
          </div>
          <div>
            <label className={labelClass}>İzlenen sezon sayısı</label>
            <input
              name="seasons_watched"
              type="number"
              min={0}
              className={inputClass}
              placeholder="Örn: 1"
            />
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
              Yüklemezseniz rafta dizi adıyla altın/cam default görsel kullanılır.
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
            <label className={labelClass}>Durum</label>
            <select name="status" className={inputClass} defaultValue="">
              <option value="">Seçin</option>
              <option value="finished">Bitirilmiş</option>
              <option value="waiting">Devamını Bekliyorum</option>
              <option value="dropped">Yarıda Bıraktım</option>
            </select>
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
            id="series_favorite"
            className="h-4 w-4 rounded border-white/30 text-amber-500 focus:ring-amber-500/50"
          />
          <label htmlFor="series_favorite" className="flex items-center gap-2 text-sm text-white/90">
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
