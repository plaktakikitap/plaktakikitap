"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Eye } from "lucide-react";

const PREVIEW_PATHS = [
  { path: "/", label: "Ana Sayfa" },
  { path: "/planner", label: "Ajanda" },
  { path: "/okuma-gunlugum", label: "Okuma Günlüğü" },
  { path: "/izleme-gunlugum", label: "İzleme Günlüğü" },
] as const;

export function AdminMiniPreview() {
  const [origin, setOrigin] = useState<string>("");
  const [path, setPath] = useState("/planner");

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  const iframeSrc = origin ? `${origin}${path}` : "";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)]">
          <Eye className="h-4 w-4" />
          Canlı Önizleme
        </h3>
        {iframeSrc && (
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--muted-foreground)] transition-colors hover:bg-white/10 hover:text-[var(--foreground)]"
            title="Yeni sekmede aç"
          >
            <ExternalLink className="h-3 w-3" />
            Aç
          </a>
        )}
      </div>
      <select
        value={path}
        onChange={(e) => setPath(e.target.value)}
        className="admin-input mb-3 w-full text-xs"
      >
        {PREVIEW_PATHS.map(({ path: p, label }) => (
          <option key={p} value={p}>
            {label}
          </option>
        ))}
      </select>
      {iframeSrc ? (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <iframe
            src={iframeSrc}
            title="Site önizleme"
            className="h-[200px] w-full"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      ) : (
        <div className="flex h-[200px] items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs text-[var(--muted-foreground)]">
          Yükleniyor…
        </div>
      )}
    </div>
  );
}
