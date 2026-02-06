"use client";

import { useState } from "react";
import { AdminJsonEditor } from "./AdminJsonEditor";

interface Link {
  id: string;
  type: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

export function AdminLinksCard({ links }: { links: Link[] }) {
  const [jsonStr, setJsonStr] = useState(() =>
    JSON.stringify(
      links.map(({ type, label, url, sort_order, is_active }) => ({
        type,
        label,
        url,
        sort_order,
        is_active,
      })),
      null,
      2
    )
  );

  return (
    <div className="h-full">
      <h3 className="admin-heading mb-5 text-sm font-medium text-white/70">
        Footer linkleri
      </h3>
      <form action="/api/admin/links" method="POST" className="space-y-4">
        <p className="text-xs text-white/50">
          JSON olarak güncelliyoruz. Otomatik formatlama ve doğrulama.
        </p>
        <AdminJsonEditor
          name="links_json"
          value={jsonStr}
          onChange={setJsonStr}
          placeholder="[]"
          minHeight={260}
        />
        <button type="submit" className="admin-btn-gold w-full px-4 py-3">
          Linkleri Kaydet
        </button>
      </form>
    </div>
  );
}
