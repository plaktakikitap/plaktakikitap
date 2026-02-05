"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSeries } from "@/app/actions";
import { StarRatingInput } from "@/components/ui/StarRating";

export function SeriesForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [episodeCount, setEpisodeCount] = useState<number>(0);
  const [avgEpisodeMin, setAvgEpisodeMin] = useState<number | "">("");
  const totalDurationMin =
    episodeCount > 0 && typeof avgEpisodeMin === "number" && avgEpisodeMin > 0
      ? episodeCount * avgEpisodeMin
      : null;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createSeries(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/series");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium">Başlık *</label>
        <input
          name="title"
          required
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
      <div>
        <label className="block text-sm font-medium">Yaratıcı / Yönetmen (creator_or_director)</label>
        <input
          name="creator_or_director"
          placeholder="Dizi yaratıcısı veya yönetmeni"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">İzlenme tarihi (watched_at)</label>
        <input
          name="watched_at"
          type="datetime-local"
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
        />
        <p className="mt-0.5 text-xs text-[var(--muted)]">Boş bırakılırsa bugün kullanılır.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Bölüm sayısı (episode_count)</label>
          <input
            name="episode_count"
            type="number"
            min={0}
            value={episodeCount}
            onChange={(e) => setEpisodeCount(parseInt(e.target.value, 10) || 0)}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Ort. bölüm süresi (dk) (avg_episode_min)</label>
          <input
            name="avg_episode_min"
            type="number"
            min={1}
            value={avgEpisodeMin}
            onChange={(e) => {
              const v = e.target.value;
              setAvgEpisodeMin(v === "" ? "" : parseInt(v, 10) || 0);
            }}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
      </div>
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--muted)]/20 px-3 py-2 text-sm text-[var(--muted)]">
        {totalDurationMin != null ? (
          <span className="font-medium text-[var(--foreground)]">Toplam süre (total_duration_min): {totalDurationMin} dk</span>
        ) : (
          "Toplam süre = episode_count × avg_episode_min — kayıtta otomatik hesaplanıp saklanır. İstatistik paneli bu değeri kullanır."
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">İzlenen sezon (seasons_watched)</label>
          <input
            name="seasons_watched"
            type="number"
            min={0}
            defaultValue={0}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Toplam sezon sayısı (total_seasons)</label>
          <input
            name="total_seasons"
            type="number"
            min={0}
            placeholder="Dizide toplam kaç sezon var"
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Puan (0–5, yıldız)</label>
          <div className="mt-1">
            <StarRatingInput
              name="rating"
              value={rating}
              onChange={setRating}
              size="lg"
            />
          </div>
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
