"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreateFilm,
  adminCreateSeries,
  adminCreateBook,
  adminDeleteContent,
} from "@/app/admin/actions";
import type { RecentItem } from "@/lib/db/queries";
import { AdminSection } from "./AdminSection";
import { AdminBentoCard } from "./AdminBentoCard";
import { Film, Tv, BookOpen, Trash2 } from "lucide-react";

function getDetail(entry: RecentItem): string {
  if (entry.type === "film") {
    const f = Array.isArray(entry.item.film) ? entry.item.film[0] : entry.item.film;
    return f ? `${f.duration_min} min${f.year ? ` · ${f.year}` : ""}` : "";
  }
  if (entry.type === "series") {
    const s = Array.isArray(entry.item.series) ? entry.item.series[0] : entry.item.series;
    return s ? `${s.episodes_watched} ep` : "";
  }
  if (entry.type === "book") {
    return entry.item.author || "";
  }
  return "";
}

interface AdminDashboardProps {
  recentItems: RecentItem[];
}

const inputClass = "admin-input";
const selectClass = "admin-input";

export function AdminDashboard({ recentItems }: AdminDashboardProps) {
  const router = useRouter();
  const [filmError, setFilmError] = useState<string | null>(null);
  const [seriesError, setSeriesError] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleFilmSubmit(formData: FormData) {
    setFilmError(null);
    const r = await adminCreateFilm(formData);
    if (r.error) setFilmError(r.error);
    else router.refresh();
  }

  async function handleSeriesSubmit(formData: FormData) {
    setSeriesError(null);
    const r = await adminCreateSeries(formData);
    if (r.error) setSeriesError(r.error);
    else router.refresh();
  }

  async function handleBookSubmit(formData: FormData) {
    setBookError(null);
    const r = await adminCreateBook(formData);
    if (r.error) setBookError(r.error);
    else router.refresh();
  }

  async function handleDelete(id: string, type: "film" | "series" | "book") {
    setDeleting(id);
    await adminDeleteContent(id, type);
    router.replace("/admin?toast=saved");
    router.refresh();
    setDeleting(null);
  }

  return (
    <AdminSection title="İçerik Yönetimi">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:auto-rows-[minmax(240px,auto)]">
        {/* Recent Items - büyük */}
        <AdminBentoCard colSpan={2} rowSpan={2} className="overflow-hidden">
          <h3 className="admin-heading mb-5 text-sm font-medium text-white/70">
            Son eklenenler
          </h3>
          {recentItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/50">
              Henüz içerik yok. Aşağıdan ekleyin.
            </p>
          ) : (
            <div className="space-y-1.5 overflow-y-auto">
              {recentItems.map((entry) => (
                <div
                  key={entry.item.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {entry.type === "film" && <Film className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />}
                    {entry.type === "series" && <Tv className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />}
                    {entry.type === "book" && <BookOpen className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />}
                    <div className="min-w-0 truncate">
                      <p className="truncate text-sm font-medium">{entry.item.title}</p>
                      <p className="truncate text-[10px] text-white/50">
                        {entry.type} · {getDetail(entry)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.item.id, entry.type)}
                    disabled={deleting === entry.item.id}
                    className="shrink-0 rounded p-1 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                    title="Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </AdminBentoCard>

        {/* Add Film */}
        <AdminBentoCard colSpan={1} rowSpan={1}>
          <h3 className="admin-heading mb-2 flex items-center gap-1.5 text-sm font-medium text-white/70">
            <Film className="h-4 w-4 text-amber-400" />
            Film ekle
          </h3>
          <form action={handleFilmSubmit} className="space-y-1">
            <input name="title" required placeholder="Başlık *" className={inputClass} />
            <input name="year" type="number" min={1900} placeholder="Yıl" className={inputClass} />
            <input name="duration_min" type="number" required min={1} placeholder="Süre (dk) *" className={inputClass} />
            <input name="rating" type="number" step="0.1" min={0} max={10} placeholder="Puan" className={inputClass} />
            <select name="visibility" className={selectClass}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
            {filmError && <p className="text-xs text-red-500">{filmError}</p>}
            <button type="submit" className="admin-btn-gold mt-1 w-full">
              Ekle
            </button>
          </form>
        </AdminBentoCard>

        {/* Add Series */}
        <AdminBentoCard colSpan={1} rowSpan={1}>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)]">
            <Tv className="h-4 w-4 text-[var(--accent)]" />
            Dizi ekle
          </h3>
          <form action={handleSeriesSubmit} className="space-y-3">
            <input name="title" required placeholder="Başlık *" className={inputClass} />
            <input name="episodes_watched" type="number" min={0} defaultValue={0} placeholder="Bölüm" className={inputClass} />
            <input name="avg_episode_min" type="number" min={1} placeholder="Ort. süre (dk)" className={inputClass} />
            <input name="rating" type="number" step="0.1" min={0} max={10} placeholder="Puan" className={inputClass} />
            <select name="visibility" className={selectClass}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
            {seriesError && <p className="text-[10px] text-red-500">{seriesError}</p>}
            <button type="submit" className="admin-btn-gold mt-2 w-full py-2 text-xs">
              Ekle
            </button>
          </form>
        </AdminBentoCard>

        {/* Add Book - geniş */}
        <AdminBentoCard colSpan={2} rowSpan={1}>
          <h3 className="admin-heading mb-2 flex items-center gap-1.5 text-sm font-medium text-white/70">
            <BookOpen className="h-4 w-4 text-amber-400" />
            Kitap ekle
          </h3>
          <form action={handleBookSubmit} className="grid grid-cols-2 gap-x-3 gap-y-1 md:grid-cols-4">
            <input name="title" required placeholder="Başlık *" className={`${inputClass} col-span-2`} />
            <input name="author" placeholder="Yazar" className={inputClass} />
            <input name="pages" type="number" min={1} placeholder="Sayfa" className={inputClass} />
            <input name="rating" type="number" step="0.1" min={0} max={10} placeholder="Puan" className={inputClass} />
            <select name="visibility" className={selectClass}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
            <textarea name="quote" rows={1} placeholder="Alıntı" className={`${inputClass} col-span-2`} />
            {bookError && <p className="col-span-full text-xs text-red-500">{bookError}</p>}
            <button type="submit" className="admin-btn-gold col-span-full mt-1 w-full">
              Ekle
            </button>
          </form>
        </AdminBentoCard>
      </div>
    </AdminSection>
  );
}
