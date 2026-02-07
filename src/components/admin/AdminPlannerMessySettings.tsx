"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Music2, Plus, Trash2, Coffee, Layers, Image, CornerDownRight } from "lucide-react";

interface CustomField {
  label: string;
  content: string;
}

interface PageSettings {
  show_coffee_stain: boolean;
  show_washi_tape: boolean;
  show_polaroid: boolean;
  show_curled_corner: boolean;
  custom_fields: CustomField[];
}

interface AdminPlannerMessySettingsProps {
  year: number;
  month: number;
}

export function AdminPlannerMessySettings({ year, month }: AdminPlannerMessySettingsProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<PageSettings>({
    show_coffee_stain: true,
    show_washi_tape: true,
    show_polaroid: true,
    show_curled_corner: true,
    custom_fields: [],
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/planner/settings?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          show_coffee_stain: data.show_coffee_stain ?? true,
          show_washi_tape: data.show_washi_tape ?? true,
          show_polaroid: data.show_polaroid ?? true,
          show_curled_corner: data.show_curled_corner ?? true,
          custom_fields: Array.isArray(data.custom_fields) ? data.custom_fields : [],
        });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [year, month]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/planner/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, ...settings }),
      });
      if (res.ok) {
        router.push(`/admin/planner?toast=saved&msg=${encodeURIComponent("Notun ajandaya iğnelendi! ✨")}`);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  function addCustomField() {
    setSettings((s) => ({
      ...s,
      custom_fields: [...s.custom_fields, { label: "", content: "" }],
    }));
  }

  function updateCustomField(i: number, field: "label" | "content", value: string) {
    setSettings((s) => ({
      ...s,
      custom_fields: s.custom_fields.map((f, j) =>
        j === i ? { ...f, [field]: value } : f
      ),
    }));
  }

  function removeCustomField(i: number) {
    setSettings((s) => ({
      ...s,
      custom_fields: s.custom_fields.filter((_, j) => j !== i),
    }));
  }

  const toggles: { key: keyof Pick<PageSettings, "show_coffee_stain" | "show_washi_tape" | "show_polaroid" | "show_curled_corner">; label: string; icon: React.ReactNode }[] = [
    { key: "show_coffee_stain", label: "Kahve lekesi ekle", icon: <Coffee className="h-4 w-4" /> },
    { key: "show_washi_tape", label: "Bant ekle", icon: <Layers className="h-4 w-4" /> },
    { key: "show_polaroid", label: "Fotoğrafı köşeye koy", icon: <Image className="h-4 w-4" /> },
    { key: "show_curled_corner", label: "Kıvrık köşe", icon: <CornerDownRight className="h-4 w-4" /> },
  ];

  if (!loaded) return null;

  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <h2 className="mb-3 flex items-center gap-2 font-medium">
        <Sparkles className="h-4 w-4" />
        Bullet Journal — Messy görünüm
      </h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Messy görünümü kontrol et — evet/hayır ile her öğeyi açıp kapat
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {toggles.map(({ key, label, icon }) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--card-border)] px-4 py-3 transition hover:bg-[var(--background)]"
          >
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(e) =>
                setSettings((s) => ({ ...s, [key]: e.target.checked }))
              }
              className="h-4 w-4 rounded"
            />
            <span className="flex shrink-0 text-[var(--muted)]">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </label>
        ))}
      </div>

      {/* Özel alanlar — sağ sayfa (Hayatımın Film Müziği vb.) */}
      <div className="mt-6 border-t border-[var(--card-border)] pt-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Music2 className="h-4 w-4" />
          Özel alanlar (sağ sayfa)
        </h3>
        <p className="mb-3 text-xs text-[var(--muted)]">
          Örneğin &quot;Hayatımın Film Müziği&quot; — bu ayın öne çıkan notları
        </p>
        {settings.custom_fields.map((f, i) => (
          <div
            key={i}
            className="mb-3 flex flex-col gap-2 rounded-lg border border-[var(--card-border)] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Başlık (örn: Hayatımın Film Müziği)"
                value={f.label}
                onChange={(e) => updateCustomField(i, "label", e.target.value)}
                className="flex-1 rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => removeCustomField(i)}
                className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]"
                aria-label="Kaldır"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <textarea
              placeholder="İçerik…"
              value={f.content}
              onChange={(e) => updateCustomField(i, "content", e.target.value)}
              rows={2}
              className="rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1.5 text-sm"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addCustomField}
          className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--card-border)] px-3 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <Plus className="h-4 w-4" />
          Alan ekle
        </button>
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
