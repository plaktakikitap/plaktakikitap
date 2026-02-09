"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Image as ImageIcon,
  Volume2,
  Wrench,
  User,
  Type,
  Link2,
  Save,
  Loader2,
  Settings,
} from "lucide-react";
import { AdminImageUpload } from "./AdminImageUpload";
import type { SiteSettingsValue } from "@/lib/site-settings";

const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30";
const labelClass = "mb-1.5 block text-sm font-medium text-white/90";

export function AdminSettingsControlCenter() {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettingsValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetch("/api/admin/site-settings")
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok && data?.error) {
          setError(data.error);
          setSettings({});
        } else {
          setSettings(data ?? {});
        }
      })
      .catch(() => setError("Ayarlar yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload: Partial<SiteSettingsValue> = {
      seo_title: (fd.get("seo_title") as string)?.trim() || null,
      seo_description: (fd.get("seo_description") as string)?.trim() || null,
      seo_keywords: (fd.get("seo_keywords") as string)?.trim() || null,
      favicon_url: (fd.get("favicon_url") as string)?.trim() || null,
      og_image_url: (fd.get("og_image_url") as string)?.trim() || null,
      sound_volume: Math.min(100, Math.max(0, parseInt(String(fd.get("sound_volume") ?? "100"), 10) || 100)),
      maintenance_mode: fd.get("maintenance_mode") === "on",
      admin_name: (fd.get("admin_name") as string)?.trim() || null,
      admin_title: (fd.get("admin_title") as string)?.trim() || null,
      intro_photo_eymen_url: (fd.get("intro_photo_eymen_url") as string)?.trim() || settings?.intro_photo_eymen_url || null,
      intro_photo_plaktakikitap_url: (fd.get("intro_photo_plaktakikitap_url") as string)?.trim() || settings?.intro_photo_plaktakikitap_url || null,
      intro_title: (fd.get("intro_title") as string)?.trim() || null,
      intro_subtitle: (fd.get("intro_subtitle") as string)?.trim() || null,
    };

    if (newPassword.trim()) {
      const res = await fetch("/api/admin/site-settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: newPassword.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Şifre güncellenemedi");
        setSaving(false);
        return;
      }
    }

    const res = await fetch("/api/admin/site-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Kaydetme hatası");
      return;
    }
    setToast("Değişiklikler kaydedildi.");
    setNewPassword("");
    router.refresh();
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}
      {toast && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {toast}
        </p>
      )}

      {/* 1. SEO & Global Metadata */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h2 className="mb-4 flex items-center gap-2 font-medium text-white">
          <Search className="h-5 w-5 text-amber-400" />
          SEO & Global Metadata
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Site başlığı (Title)</label>
            <input name="seo_title" type="text" className={inputClass} defaultValue={settings.seo_title ?? ""} placeholder="Örn: plaktakikitap — Film, Kitap" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Site açıklaması (Description)</label>
            <textarea name="seo_description" rows={2} className={inputClass} defaultValue={settings.seo_description ?? ""} placeholder="Arama motorları için kısa açıklama" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Anahtar kelimeler (Keywords)</label>
            <input name="seo_keywords" type="text" className={inputClass} defaultValue={settings.seo_keywords ?? ""} placeholder="film, kitap, dizi, virgülle ayırın" />
          </div>
          <div>
            <label className={labelClass}>Favicon URL</label>
            <AdminImageUpload name="favicon_url" value={settings.favicon_url ?? ""} placeholder="Favicon yükle" />
            <p className="mt-1 text-xs text-white/50">Boş bırakırsanız mevcut /images/favicon.png kullanılır.</p>
          </div>
          <div>
            <label className={labelClass}>OG Image (paylaşım görseli)</label>
            <AdminImageUpload name="og_image_url" value={settings.og_image_url ?? ""} placeholder="OG görsel yükle" />
          </div>
        </div>
      </section>

      {/* 2. Site Genel Değişkenleri */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h2 className="mb-4 flex items-center gap-2 font-medium text-white">
          <Settings className="h-5 w-5 text-amber-400" />
          Site Genel Değişkenleri
        </h2>

        <div className="space-y-6">
          <div>
            <label className={labelClass}>Sistem sesleri seviyesi (0–100)</label>
            <input
              name="sound_volume"
              type="range"
              min={0}
              max={100}
              defaultValue={settings.sound_volume ?? 100}
              className="w-full accent-amber-500"
            />
            <p className="mt-1 text-xs text-white/50">0 = kapalı, 100 = tam ses. Sayfa çevirme ve tık sesleri.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="maintenance_mode"
              id="maintenance_mode"
              defaultChecked={!!settings.maintenance_mode}
              className="h-4 w-4 rounded border-white/30 text-amber-500"
            />
            <label htmlFor="maintenance_mode" className="text-sm text-white/90">
              Bakım modu (site &quot;Yapım Aşamasında&quot; görünür)
            </label>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <User className="h-4 w-4" />
              Admin profil
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Adın</label>
                <input name="admin_name" type="text" className={inputClass} defaultValue={settings.admin_name ?? ""} placeholder="Eymen" />
              </div>
              <div>
                <label className={labelClass}>Unvan</label>
                <input name="admin_title" type="text" className={inputClass} defaultValue={settings.admin_title ?? ""} placeholder="İçerik üretici" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Yeni şifre (değiştirmek için doldur)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Boş bırakırsanız şifre değişmez"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <ImageIcon className="h-4 w-4" />
              Ana sayfa fotoğrafları
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>eymen.jpeg (portre)</label>
                <AdminImageUpload name="intro_photo_eymen_url" value={settings.intro_photo_eymen_url ?? ""} placeholder="Portre yükle" />
              </div>
              <div>
                <label className={labelClass}>plaktakikitap.jpeg (logo)</label>
                <AdminImageUpload name="intro_photo_plaktakikitap_url" value={settings.intro_photo_plaktakikitap_url ?? ""} placeholder="Logo yükle" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <Type className="h-4 w-4" />
              Ana sayfa metinleri
            </h3>
            <div className="grid gap-3">
              <div>
                <label className={labelClass}>Başlık</label>
                <input name="intro_title" type="text" className={inputClass} defaultValue={settings.intro_title ?? ""} placeholder="Hoş geldiniz, ben Eymen!" />
              </div>
              <div>
                <label className={labelClass}>Alt başlık</label>
                <input name="intro_subtitle" type="text" className={inputClass} defaultValue={settings.intro_subtitle ?? ""} placeholder="yanii... nam-ı diğer Plaktaki Kitap" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Footer & Navigasyon */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h2 className="mb-4 flex items-center gap-2 font-medium text-white">
          <Link2 className="h-5 w-5 text-amber-400" />
          Footer &amp; Navigasyon
        </h2>
        <p className="text-sm text-white/70">
          Footer sosyal linklerini (Instagram, Twitter, Academia vb.){" "}
          <a href="/admin/socials" className="text-amber-400 underline hover:no-underline">
            Bana Ulaşın
          </a>{" "}
          sayfasından yönetebilirsiniz.
        </p>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Kaydediliyor…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
