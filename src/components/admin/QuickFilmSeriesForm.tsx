"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createFilm, createSeries } from "@/app/actions";
import { showAdminToast } from "./admin-toast-events";
import {
  AdminFieldLabel,
  AdminOptionalSection,
  AdminRecentList,
  AdminSaveBar,
  AdminTextArea,
  AdminTextInput,
  useAdminCmdEnter,
} from "./AdminFormPrimitives";

type Kind = "film" | "series";

type RecentWatch = {
  id: string;
  title: string;
  meta?: string;
};

function nowLocalDatetime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function QuickFilmSeriesForm({
  recent = [],
}: {
  recent?: RecentWatch[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  useAdminCmdEnter(formRef);

  const [kind, setKind] = useState<Kind>("film");
  const [title, setTitle] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [rating, setRating] = useState(0);
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [review, setReview] = useState("");
  const [watchedAt, setWatchedAt] = useState(nowLocalDatetime);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setWatchedAt(nowLocalDatetime());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      showAdminToast("error", "Başlık zorunludur.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("title", t);
      fd.set("poster_url", posterUrl.trim());
      fd.set("visibility", "public");
      if (rating > 0) {
        fd.set("rating_5", String(rating));
        fd.set("rating", String(rating * 2));
      }
      if (year.trim()) fd.set("year", year.trim());
      if (genre.trim()) fd.set("genre_tags", genre.trim());
      if (review.trim()) fd.set("review", review.trim());
      fd.set("watched_at", watchedAt || nowLocalDatetime());

      let result: { error?: string; success?: boolean };
      if (kind === "film") {
        fd.set("duration_min", "90");
        result = await createFilm(fd);
      } else {
        fd.set("episodes_watched", "1");
        result = await createSeries(fd);
      }

      if (result?.error) {
        showAdminToast("error", result.error);
        return;
      }

      showAdminToast(
        "success",
        kind === "film" ? "Film eklendi ✓" : "Dizi eklendi ✓"
      );
      setTitle("");
      setPosterUrl("");
      setRating(0);
      setYear("");
      setGenre("");
      setReview("");
      setWatchedAt(nowLocalDatetime());
      router.refresh();
    } catch {
      showAdminToast("error", "Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
    >
      <AdminRecentList items={recent.slice(0, 5)} />

      <div className="space-y-4">
        <div>
          <AdminFieldLabel htmlFor="watch-title" required>
            Başlık
          </AdminFieldLabel>
          <AdminTextInput
            id="watch-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            placeholder="Film veya dizi adı"
          />
        </div>

        <fieldset>
          <AdminFieldLabel required>Film / Dizi</AdminFieldLabel>
          <div className="flex gap-4 pt-1">
            {(
              [
                ["film", "Film"],
                ["series", "Dizi"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm text-white/80"
              >
                <input
                  type="radio"
                  name="kind"
                  value={value}
                  checked={kind === value}
                  onChange={() => setKind(value)}
                  className="accent-amber-500"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <AdminFieldLabel htmlFor="watch-poster">Afiş URL</AdminFieldLabel>
          <AdminTextInput
            id="watch-poster"
            type="url"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>

        <div>
          <AdminFieldLabel htmlFor="watch-rating">
            Puan ({rating.toFixed(1)})
          </AdminFieldLabel>
          <input
            id="watch-rating"
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="mt-0.5 flex justify-between text-[10px] text-white/35">
            <span>0</span>
            <span>5</span>
          </div>
        </div>

        <AdminOptionalSection>
          <div>
            <AdminFieldLabel htmlFor="watch-year">Yıl</AdminFieldLabel>
            <AdminTextInput
              id="watch-year"
              type="number"
              min={1900}
              max={2100}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2024"
            />
          </div>
          <div>
            <AdminFieldLabel htmlFor="watch-genre">Tür</AdminFieldLabel>
            <AdminTextInput
              id="watch-genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Dram, Komedi…"
            />
          </div>
          <div>
            <AdminFieldLabel htmlFor="watch-review">Yorum</AdminFieldLabel>
            <AdminTextArea
              id="watch-review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              placeholder="Kısa yorum…"
            />
          </div>
          <div>
            <AdminFieldLabel htmlFor="watch-date">Tarih</AdminFieldLabel>
            <AdminTextInput
              id="watch-date"
              type="datetime-local"
              value={watchedAt}
              onChange={(e) => setWatchedAt(e.target.value)}
            />
          </div>
        </AdminOptionalSection>

        <AdminSaveBar loading={loading} />
      </div>
    </form>
  );
}
