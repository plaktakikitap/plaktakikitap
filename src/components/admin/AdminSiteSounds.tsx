"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSoundsEnabled } from "@/hooks/useSound";

export function AdminSiteSounds() {
  const [enabled, toggle] = useSoundsEnabled();

  return (
    <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        {enabled ? (
          <Volume2 className="h-5 w-5 text-[var(--accent)]" />
        ) : (
          <VolumeX className="h-5 w-5 text-[var(--muted)]" />
        )}
        Site Sesleri
      </h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Giriş ekranı (Plak/Kitap) ve ajanda sayfa çevirme seslerini kontrol eder
      </p>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--card-border)] px-4 py-3 transition hover:bg-[var(--background)]">
        <input
          type="checkbox"
          checked={enabled}
          onChange={toggle}
          className="h-5 w-5 rounded border-[var(--input)]"
        />
        <span className="text-sm font-medium">
          Site Sesleri: {enabled ? "Açık" : "Kapalı"}
        </span>
      </label>
    </section>
  );
}
