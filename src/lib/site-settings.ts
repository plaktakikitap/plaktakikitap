import "server-only";
import { createServerClient } from "@/lib/supabase/server";

export interface SiteSettingsValue {
  /** SEO */
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  favicon_url?: string | null;
  og_image_url?: string | null;
  /** Global */
  sound_volume?: number | null;
  maintenance_mode?: boolean | null;
  admin_name?: string | null;
  admin_title?: string | null;
  admin_password_hash?: string | null;
  /** Ana sayfa intro */
  intro_photo_eymen_url?: string | null;
  intro_photo_plaktakikitap_url?: string | null;
  intro_title?: string | null;
  intro_subtitle?: string | null;
}

const DEFAULTS: SiteSettingsValue = {
  seo_title: "plaktakikitap — Film, Kitap, Proje Koleksiyonu",
  seo_description: "Kişisel film, dizi, kitap ve proje koleksiyonum",
  seo_keywords: null,
  favicon_url: "/images/favicon.png",
  og_image_url: null,
  sound_volume: 100,
  maintenance_mode: false,
  admin_name: null,
  admin_title: null,
  admin_password_hash: null,
  intro_photo_eymen_url: "/images/eymen.jpeg",
  intro_photo_plaktakikitap_url: "/images/plaktakikitap.jpeg",
  intro_title: "Hoş geldiniz, ben Eymen!",
  intro_subtitle: "yanii... nam-ı diğer Plaktaki Kitap",
};

export async function getSiteSettings(): Promise<SiteSettingsValue> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .limit(1)
    .order("updated_at", { ascending: false })
    .maybeSingle();

  const raw = (data?.value as Record<string, unknown> | null) ?? {};
  return { ...DEFAULTS, ...raw } as SiteSettingsValue;
}

export async function updateSiteSettings(partial: Partial<SiteSettingsValue>): Promise<{ id: string } | { error: string }> {
  const supabase = await createServerClient();
  const { data: existing } = await supabase
    .from("site_settings")
    .select("id, value")
    .limit(1)
    .order("updated_at", { ascending: false })
    .maybeSingle();

  const current = (existing?.value as Record<string, unknown> | null) ?? {};
  const next = { ...current, ...partial };

  if (existing?.id) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value: next, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) return { error: error.message };
    return { id: existing.id };
  }

  const { data: inserted, error } = await supabase
    .from("site_settings")
    .insert({ value: next })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: inserted!.id };
}
