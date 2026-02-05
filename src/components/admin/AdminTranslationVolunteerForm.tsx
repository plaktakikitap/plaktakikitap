"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateTranslationVolunteer } from "@/app/admin/actions";
import type { TranslationVolunteerProjectRow } from "@/types/database";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

export function AdminTranslationVolunteerForm({ project }: { project: TranslationVolunteerProjectRow }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await adminUpdateTranslationVolunteer(project.id, new FormData(e.currentTarget));
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/translations");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className={labelClass}>Kurum adı *</label>
        <input name="org_name" required defaultValue={project.org_name} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Rol</label>
        <input name="role_title" defaultValue={project.role_title ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Yıllar</label>
        <input name="years" defaultValue={project.years ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Açıklama</label>
        <textarea name="description" rows={4} defaultValue={project.description ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Highlight’lar (her satıra bir)</label>
        <textarea name="highlights" rows={4} defaultValue={project.highlights?.join("\n") ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>website_url</label>
        <input name="website_url" type="url" defaultValue={project.website_url ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>instagram_url</label>
        <input name="instagram_url" type="url" defaultValue={project.instagram_url ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>x_url</label>
        <input name="x_url" type="url" defaultValue={project.x_url ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>order_index</label>
        <input name="order_index" type="number" defaultValue={project.order_index} className={inputClass} />
      </div>
      <button type="submit" disabled={loading} className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50">
        Kaydet
      </button>
    </form>
  );
}
