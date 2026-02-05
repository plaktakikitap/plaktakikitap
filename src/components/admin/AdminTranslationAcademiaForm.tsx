"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpsertTranslationAcademia } from "@/app/admin/actions";
import type { TranslationAcademia } from "@/lib/db/queries";
import { Plus, Trash2 } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

export function AdminTranslationAcademiaForm({
  initial,
}: {
  initial: TranslationAcademia | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileUrl, setProfileUrl] = useState(initial?.profile_url ?? "");
  const [projects, setProjects] = useState<{ title: string; url: string }[]>(
    initial?.projects?.length ? initial.projects : [{ title: "", url: "" }]
  );

  function addProject() {
    setProjects((p) => [...p, { title: "", url: "" }]);
  }

  function removeProject(i: number) {
    setProjects((p) => p.filter((_, j) => j !== i));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData();
    formData.set(
      "translation_academia_json",
      JSON.stringify({
        profile_url: profileUrl.trim(),
        projects: projects.filter((p) => p.title.trim() && p.url.trim()),
      })
    );
    const result = await adminUpsertTranslationAcademia(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6"
    >
      <h3 className="text-lg font-semibold">Academia.edu</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Profil linki ve proje listesi. Çeviriler sayfasında minimalist liste olarak gösterilir.
      </p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-4">
        <label className={labelClass}>Profil URL (Academia.edu hesabın)</label>
        <input
          type="url"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          placeholder="https://academia.edu/..."
          className={inputClass}
        />
      </div>
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className={labelClass}>Projeler (başlık + link)</span>
          <button
            type="button"
            onClick={addProject}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-[var(--accent)] hover:bg-[var(--accent-soft)]"
          >
            <Plus className="h-4 w-4" /> Ekle
          </button>
        </div>
        <div className="space-y-3">
          {projects.map((p, i) => (
            <div key={i} className="flex gap-2 rounded-lg border border-[var(--card-border)] p-3">
              <input
                type="text"
                value={p.title}
                onChange={(e) =>
                  setProjects((prev) =>
                    prev.map((q, j) => (j === i ? { ...q, title: e.target.value } : q))
                  )
                }
                placeholder="Proje başlığı"
                className={inputClass}
              />
              <input
                type="url"
                value={p.url}
                onChange={(e) =>
                  setProjects((prev) =>
                    prev.map((q, j) => (j === i ? { ...q, url: e.target.value } : q))
                  )
                }
                placeholder="URL"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeProject(i)}
                className="shrink-0 rounded p-2 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-600"
                aria-label="Kaldır"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-6 rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
      >
        {loading ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
