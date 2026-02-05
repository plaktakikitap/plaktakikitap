"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Youtube, ImageIcon, Briefcase, Award, ListTodo, Settings, Plus, Trash2 } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";
const btnClass = "rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50";

type Video = { id: string; title: string; youtube_url: string; order_index: number };
type Art = { id: string; image_url: string; caption: string; order_index: number };
type Project = { id: string; title: string; slug: string; summary: string; link_url: string; order_index: number };
type Badge = { id: string; title: string; image_url: string; link_url: string; order_index: number };
type Experience = { id: string; company: string; role: string; period: string; description: string; order_index: number };

type Props = {
  videos: Video[];
  art: Art[];
  projects: Project[];
  badges: Badge[];
  experiences: Experience[];
  cvDownloadUrl: string;
};

export function AdminWorksPanel({
  videos,
  art,
  projects,
  badges,
  experiences,
  cvDownloadUrl,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cvUrl, setCvUrl] = useState(cvDownloadUrl);

  async function addVideo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const res = await fetch("/api/admin/works/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: (form.querySelector('[name="title"]') as HTMLInputElement)?.value ?? "",
        youtube_url: (form.querySelector('[name="youtube_url"]') as HTMLInputElement)?.value ?? "",
        order_index: videos.length,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Hata");
      return;
    }
    form.reset();
    router.refresh();
  }

  async function deleteVideo(id: string) {
    if (!confirm("Bu videoyu silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await fetch(`/api/admin/works/videos/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  async function addArt(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const res = await fetch("/api/admin/works/art", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: (form.querySelector('[name="image_url"]') as HTMLInputElement)?.value ?? "",
        caption: (form.querySelector('[name="caption"]') as HTMLInputElement)?.value ?? "",
        order_index: art.length,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Hata");
      return;
    }
    form.reset();
    router.refresh();
  }

  async function deleteArt(id: string) {
    if (!confirm("Bu görseli silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await fetch(`/api/admin/works/art/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const res = await fetch("/api/admin/works/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: (form.querySelector('[name="title"]') as HTMLInputElement)?.value ?? "",
        slug: (form.querySelector('[name="slug"]') as HTMLInputElement)?.value ?? "",
        summary: (form.querySelector('[name="summary"]') as HTMLTextAreaElement)?.value ?? "",
        link_url: (form.querySelector('[name="link_url"]') as HTMLInputElement)?.value ?? "",
        order_index: projects.length,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Hata");
      return;
    }
    form.reset();
    router.refresh();
  }

  async function deleteProject(id: string) {
    if (!confirm("Bu projeyi silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await fetch(`/api/admin/works/projects/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  async function addBadge(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const res = await fetch("/api/admin/works/badges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: (form.querySelector('[name="title"]') as HTMLInputElement)?.value ?? "",
        image_url: (form.querySelector('[name="image_url"]') as HTMLInputElement)?.value ?? "",
        link_url: (form.querySelector('[name="link_url"]') as HTMLInputElement)?.value ?? "",
        order_index: badges.length,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Hata");
      return;
    }
    form.reset();
    router.refresh();
  }

  async function deleteBadge(id: string) {
    if (!confirm("Bu rozeti silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await fetch(`/api/admin/works/badges/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  async function addExperience(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const res = await fetch("/api/admin/works/experiences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: (form.querySelector('[name="company"]') as HTMLInputElement)?.value ?? "",
        role: (form.querySelector('[name="role"]') as HTMLInputElement)?.value ?? "",
        period: (form.querySelector('[name="period"]') as HTMLInputElement)?.value ?? "",
        description: (form.querySelector('[name="description"]') as HTMLTextAreaElement)?.value ?? "",
        order_index: experiences.length,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Hata");
      return;
    }
    form.reset();
    router.refresh();
  }

  async function deleteExperience(id: string) {
    if (!confirm("Bu deneyimi silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await fetch(`/api/admin/works/experiences/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
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
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Hata");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-10">
      {error && <p className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* YouTube Videos */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Youtube className="h-5 w-5" /> YouTube Videoları
        </h2>
        <ul className="mb-4 space-y-2">
          {videos.map((v) => (
            <li key={v.id} className="flex items-center justify-between rounded-lg bg-[var(--background)] px-3 py-2 text-sm">
              <span className="truncate">{v.title || v.youtube_url}</span>
              <button type="button" onClick={() => deleteVideo(v.id)} className="text-red-500 hover:underline" disabled={loading}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addVideo} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className={labelClass}>Başlık</label>
            <input name="title" type="text" className={inputClass} placeholder="Video başlığı" />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className={labelClass}>YouTube URL</label>
            <input name="youtube_url" type="url" className={inputClass} placeholder="https://youtube.com/..." required />
          </div>
          <button type="submit" className={btnClass} disabled={loading}><Plus className="mr-1 inline h-4 w-4" /> Ekle</button>
        </form>
      </section>

      {/* Art / Photography */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <ImageIcon className="h-5 w-5" /> Sanat & Fotoğraf
        </h2>
        <ul className="mb-4 space-y-2">
          {art.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-lg bg-[var(--background)] px-3 py-2 text-sm">
              <span className="truncate">{a.caption || a.image_url.slice(0, 40)}</span>
              <button type="button" onClick={() => deleteArt(a.id)} className="text-red-500 hover:underline" disabled={loading}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addArt} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className={labelClass}>Görsel URL</label>
            <input name="image_url" type="url" className={inputClass} placeholder="https://..." required />
          </div>
          <div className="min-w-[120px]">
            <label className={labelClass}>Altyazı</label>
            <input name="caption" type="text" className={inputClass} placeholder="İsteğe bağlı" />
          </div>
          <button type="submit" className={btnClass} disabled={loading}><Plus className="mr-1 inline h-4 w-4" /> Ekle</button>
        </form>
      </section>

      {/* Projects */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Briefcase className="h-5 w-5" /> Projeler (Tourmania, Amazon vb.)
        </h2>
        <ul className="mb-4 space-y-2">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-lg bg-[var(--background)] px-3 py-2 text-sm">
              <span className="truncate">{p.title} — {p.slug}</span>
              <button type="button" onClick={() => deleteProject(p.id)} className="text-red-500 hover:underline" disabled={loading}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addProject} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Başlık</label>
              <input name="title" type="text" className={inputClass} placeholder="Tourmania" required />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input name="slug" type="text" className={inputClass} placeholder="tourmania" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Özet</label>
            <textarea name="summary" className={inputClass} rows={2} placeholder="Kısa açıklama" />
          </div>
          <div>
            <label className={labelClass}>Link URL (İncele)</label>
            <input name="link_url" type="url" className={inputClass} placeholder="https://..." />
          </div>
          <button type="submit" className={btnClass} disabled={loading}><Plus className="mr-1 inline h-4 w-4" /> Ekle</button>
        </form>
      </section>

      {/* Badges */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Award className="h-5 w-5" /> Sertifika / Rozetler
        </h2>
        <ul className="mb-4 space-y-2">
          {badges.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-lg bg-[var(--background)] px-3 py-2 text-sm">
              <span className="truncate">{b.title}</span>
              <button type="button" onClick={() => deleteBadge(b.id)} className="text-red-500 hover:underline" disabled={loading}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addBadge} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[160px]">
            <label className={labelClass}>Başlık</label>
            <input name="title" type="text" className={inputClass} placeholder="AWS Certified" required />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className={labelClass}>Rozet görsel URL</label>
            <input name="image_url" type="url" className={inputClass} placeholder="https://..." />
          </div>
          <div className="min-w-[160px]">
            <label className={labelClass}>Link (isteğe bağlı)</label>
            <input name="link_url" type="url" className={inputClass} placeholder="https://..." />
          </div>
          <button type="submit" className={btnClass} disabled={loading}><Plus className="mr-1 inline h-4 w-4" /> Ekle</button>
        </form>
      </section>

      {/* Experiences (CV) */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <ListTodo className="h-5 w-5" /> İş Deneyimleri (CV)
        </h2>
        <ul className="mb-4 space-y-2">
          {experiences.map((e) => (
            <li key={e.id} className="flex items-center justify-between rounded-lg bg-[var(--background)] px-3 py-2 text-sm">
              <span className="truncate">{e.company} — {e.role} ({e.period})</span>
              <button type="button" onClick={() => deleteExperience(e.id)} className="text-red-500 hover:underline" disabled={loading}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addExperience} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Şirket</label>
              <input name="company" type="text" className={inputClass} placeholder="Amazon" required />
            </div>
            <div>
              <label className={labelClass}>Rol</label>
              <input name="role" type="text" className={inputClass} placeholder="Software Engineer" required />
            </div>
            <div>
              <label className={labelClass}>Dönem</label>
              <input name="period" type="text" className={inputClass} placeholder="2020 – 2023" required />
            </div>
          </div>
          <div>
            <label className={labelClass}>Açıklama (isteğe bağlı)</label>
            <textarea name="description" className={inputClass} rows={2} placeholder="Kısa özet" />
          </div>
          <button type="submit" className={btnClass} disabled={loading}><Plus className="mr-1 inline h-4 w-4" /> Ekle</button>
        </form>
      </section>

      {/* CV Download URL */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Settings className="h-5 w-5" /> CV İndir linki
        </h2>
        <form onSubmit={saveCvUrl} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[280px] flex-1">
            <label className={labelClass}>CV PDF URL</label>
            <input
              type="url"
              className={inputClass}
              value={cvUrl}
              onChange={(e) => setCvUrl(e.target.value)}
              placeholder="https://.../cv.pdf"
            />
          </div>
          <button type="submit" className={btnClass} disabled={loading}>Kaydet</button>
        </form>
      </section>
    </div>
  );
}
