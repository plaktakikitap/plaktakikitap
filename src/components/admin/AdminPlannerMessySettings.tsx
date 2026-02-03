"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface PageSettings {
  show_coffee_stain: boolean;
  show_washi_tape: boolean;
  show_polaroid: boolean;
  show_curled_corner: boolean;
}

export function AdminPlannerMessySettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<PageSettings>({
    show_coffee_stain: true,
    show_washi_tape: true,
    show_polaroid: true,
    show_curled_corner: true,
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/planner/settings?year=2026&month=1")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          show_coffee_stain: data.show_coffee_stain ?? true,
          show_washi_tape: data.show_washi_tape ?? true,
          show_polaroid: data.show_polaroid ?? true,
          show_curled_corner: data.show_curled_corner ?? true,
        });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/planner/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: 2026, month: 1, ...settings }),
    });
    setSaving(false);
    router.refresh();
  }

  const toggles: { key: keyof PageSettings; label: string }[] = [
    { key: "show_coffee_stain", label: "Kahve lekesi" },
    { key: "show_washi_tape", label: "Washi tape (bant)" },
    { key: "show_polaroid", label: "Polaroid fotoğraflar" },
    { key: "show_curled_corner", label: "Kıvrık köşe" },
  ];

  if (!loaded) return null;

  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <h2 className="mb-3 flex items-center gap-2 font-medium">
        <Sparkles className="h-4 w-4" />
        Bullet Journal — Messy görünüm
      </h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Ajandadaki dağınık estetik öğelerini aç/kapat
      </p>
      <div className="flex flex-wrap gap-4">
        {toggles.map(({ key, label }) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--card-border)] px-3 py-2 transition hover:bg-[var(--background)]"
          >
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(e) =>
                setSettings((s) => ({ ...s, [key]: e.target.checked }))
              }
              className="h-4 w-4 rounded"
            />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </section>
  );
}
