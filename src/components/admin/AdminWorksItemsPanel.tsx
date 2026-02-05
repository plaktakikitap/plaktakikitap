"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WorksItem, WorksItemType } from "@/types/works";

const inputClass = "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";
const btnClass = "rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50";

const TABS: { id: WorksItemType | "cv"; label: string }[] = [
  { id: "youtube", label: "Videolar" },
  { id: "art", label: "Sanat / Resim" },
  { id: "photo", label: "Fotoğraf" },
  { id: "experience", label: "Deneyim" },
  { id: "project", label: "Projeler" },
  { id: "software", label: "Yazılım" },
  { id: "certificate", label: "Sertifikalar" },
  { id: "cv_role", label: "CV Roller" },
  { id: "cv", label: "CV PDF" },
];

type Props = {
  items: WorksItem[];
  cvDownloadUrl: string;
};

export function AdminWorksItemsPanel({ items: initialItems, cvDownloadUrl }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState<WorksItemType | "cv">("youtube");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cvUrl, setCvUrl] = useState(cvDownloadUrl);

  const filtered =
    tab === "cv" ? [] : items.filter((i) => (tab === "art" || tab === "photo" ? i.type === tab : i.type === tab));

  async function refetch() {
    const res = await fetch("/api/admin/works/items");
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
    router.refresh();
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body: Record<string, unknown> = {
      type: tab,
      title: fd.get("title") ?? "",
      subtitle: fd.get("subtitle") || null,
      description: fd.get("description") || null,
      tags: [],
      url: fd.get("url") || null,
      external_url: fd.get("external_url") || null,
      image_url: fd.get("image_url") || null,
      meta: {},
      sort_order: items.length,
      is_featured: fd.get("featured") === "on",
      visibility: (fd.get("visibility") as string) || "public",
    };
    if (tab === "certificate" && fd.get("issuer")) (body.meta as Record<string, unknown>).issuer = fd.get("issuer");
    if (tab === "certificate" && fd.get("year")) (body.meta as Record<string, unknown>).year = fd.get("year");
    if (tab === "cv_role") {
      (body.meta as Record<string, unknown>).org = fd.get("org") || null;
      (body.meta as Record<string, unknown>).start_year = fd.get("start_year") || null;
      (body.meta as Record<string, unknown>).end_year = fd.get("end_year") || null;
    }
    if (tab === "project" || tab === "experience") {
      (body.meta as Record<string, unknown>).role = fd.get("role") || null;
      (body.meta as Record<string, unknown>).metrics = fd.get("metrics") || null;
    }
    if (tab === "software") {
      const stack = (fd.get("stack") as string)?.split(",").map((s) => s.trim()).filter(Boolean);
      (body.meta as Record<string, unknown>).stack = stack;
      (body.meta as Record<string, unknown>).github_url = fd.get("github_url") || null;
    }
    const res = await fetch("/api/admin/works/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Hata");
      return;
    }
    form.reset();
    await refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await fetch(`/api/admin/works/items/${id}`, { method: "DELETE" });
    setLoading(false);
    await refetch();
  }

  async function handleSortOrder(id: string, sort_order: number) {
    const res = await fetch(`/api/admin/works/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sort_order }),
    });
    if (res.ok) await refetch();
  }

  async function saveCvUrl(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/works/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "cv_download_url", value: cvUrl }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else setError("Kaydetme hatası");
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2 border-b border-[var(--card-border)] pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded px-3 py-1.5 text-sm ${tab === t.id ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "cv" ? (
        <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <h3 className="mb-3 font-medium">CV İndir linki</h3>
          <form onSubmit={saveCvUrl} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[280px] flex-1">
              <label className={labelClass}>PDF URL</label>
              <input type="url" className={inputClass} value={cvUrl} onChange={(e) => setCvUrl(e.target.value)} placeholder="https://..." />
            </div>
            <button type="submit" className={btnClass} disabled={loading}>Kaydet</button>
          </form>
        </section>
      ) : (
        <>
          <ul className="space-y-2">
            {filtered.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg bg-[var(--background)] px-3 py-2 text-sm">
                <span className="truncate">{item.title}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-14 rounded border border-[var(--card-border)] bg-[var(--background)] px-2 py-1 text-xs"
                    defaultValue={item.sort_order}
                    onBlur={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isNaN(v)) handleSortOrder(item.id, v);
                    }}
                  />
                  <button type="button" onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline" disabled={loading}>
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <form onSubmit={handleCreate} className="mt-4 space-y-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <h3 className="font-medium">Yeni ekle</h3>
            <div>
              <label className={labelClass}>Başlık *</label>
              <input name="title" type="text" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Alt başlık</label>
              <input name="subtitle" type="text" className={inputClass} />
            </div>
            {(tab === "youtube" || tab === "project" || tab === "experience" || tab === "software" || tab === "certificate") && (
              <div>
                <label className={labelClass}>URL</label>
                <input name="url" type="url" className={inputClass} />
              </div>
            )}
            {(tab === "art" || tab === "photo" || tab === "certificate") && (
              <div>
                <label className={labelClass}>Görsel URL (veya yükledikten sonra path)</label>
                <input name="image_url" type="text" className={inputClass} placeholder="works-media/..." />
              </div>
            )}
            {(tab === "project" || tab === "experience") && (
              <>
                <div>
                  <label className={labelClass}>Rol (meta.role)</label>
                  <input name="role" type="text" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Metrik (meta.metrics)</label>
                  <input name="metrics" type="text" className={inputClass} placeholder="Haftada X içerik" />
                </div>
              </>
            )}
            {tab === "software" && (
              <>
                <div>
                  <label className={labelClass}>Stack (virgülle)</label>
                  <input name="stack" type="text" className={inputClass} placeholder="React, Node" />
                </div>
                <div>
                  <label className={labelClass}>GitHub URL</label>
                  <input name="github_url" type="url" className={inputClass} />
                </div>
              </>
            )}
            {tab === "certificate" && (
              <>
                <div>
                  <label className={labelClass}>Veren (meta.issuer)</label>
                  <input name="issuer" type="text" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Yıl (meta.year)</label>
                  <input name="year" type="text" className={inputClass} />
                </div>
              </>
            )}
            {tab === "cv_role" && (
              <>
                <div>
                  <label className={labelClass}>Kurum (meta.org)</label>
                  <input name="org" type="text" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>Başlangıç yılı</label>
                    <input name="start_year" type="text" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Bitiş yılı</label>
                    <input name="end_year" type="text" className={inputClass} />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className={labelClass}>Açıklama</label>
              <textarea name="description" className={inputClass} rows={2} />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input name="featured" type="checkbox" className="rounded" />
                <span className="text-sm">Öne çıkan</span>
              </label>
              <select name="visibility" className="rounded border border-[var(--card-border)] bg-[var(--background)] px-2 py-1 text-sm">
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
            <button type="submit" className={btnClass} disabled={loading}>Ekle</button>
          </form>
        </>
      )}
    </div>
  );
}
