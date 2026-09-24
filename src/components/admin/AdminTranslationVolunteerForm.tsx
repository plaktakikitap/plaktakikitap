"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateTranslationVolunteer } from "@/app/secretgate/actions";
import type { TranslationVolunteerProjectRow } from "@/types/database";

export function AdminTranslationVolunteerForm({
  project,
}: {
  project: TranslationVolunteerProjectRow;
}) {
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
    router.push("/secretgate/translations");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {error ? <p className="admin-error">{error}</p> : null}
      <div>
        <label className="admin-label">Kurum adı *</label>
        <input name="org_name" required defaultValue={project.org_name} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">Rol</label>
        <input name="role_title" defaultValue={project.role_title ?? ""} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">Yıllar</label>
        <input name="years" defaultValue={project.years ?? ""} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">Açıklama</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={project.description ?? ""}
          className="admin-input min-h-[6rem]"
        />
      </div>
      <div>
        <label className="admin-label">Öne çıkanlar</label>
        <textarea
          name="highlights"
          rows={4}
          defaultValue={project.highlights?.join("\n") ?? ""}
          className="admin-input min-h-[6rem]"
        />
        <p className="admin-hint">Her satır ayrı madde olur.</p>
      </div>
      <div>
        <label className="admin-label">Website</label>
        <input name="website_url" type="text" defaultValue={project.website_url ?? ""} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">Instagram</label>
        <input name="instagram_url" type="text" defaultValue={project.instagram_url ?? ""} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">X</label>
        <input name="x_url" type="text" defaultValue={project.x_url ?? ""} className="admin-input" />
      </div>
      <div>
        <label className="admin-label">Sıra</label>
        <input name="order_index" type="number" defaultValue={project.order_index} className="admin-input" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="admin-btn-gold disabled:opacity-50">
          {loading ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/secretgate/translations")}
          className="rounded-xl border border-[#e8e0d4] px-4 py-2.5 text-sm text-[#1a1612]/65 transition-colors hover:border-[#d4c9bb] hover:text-[#1a1612]"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
