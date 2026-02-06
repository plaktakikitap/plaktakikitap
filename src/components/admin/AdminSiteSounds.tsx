"use client";

import { useSoundsEnabled } from "@/hooks/useSound";

const BARS = 5;

export function AdminSiteSounds() {
  const [enabled, toggle] = useSoundsEnabled();

  return (
    <div className="h-full">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)]">
        Site Sesleri
      </h3>
      <p className="mb-4 text-xs text-[var(--muted-foreground)]">
        Giriş ekranı ve ajanda sayfa çevirme sesleri
      </p>
      <button
        type="button"
        onClick={toggle}
        aria-label={enabled ? "Sesleri kapat" : "Sesleri aç"}
        className="admin-sound-btn group flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus-ring)]"
      >
        <div className="flex items-end gap-1" style={{ height: 24 }}>
          {Array.from({ length: BARS }).map((_, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-current transition-colors"
              style={{
                height: enabled ? [8, 14, 20, 14, 8][i] : 6,
                animation: enabled ? "admin-sound-bar 0.6s ease-in-out infinite" : "none",
                animationDelay: enabled ? `${i * 0.08}s` : undefined,
              }}
            />
          ))}
        </div>
        <span className="text-sm font-medium">
          {enabled ? "Açık" : "Kapalı"}
        </span>
      </button>
    </div>
  );
}
