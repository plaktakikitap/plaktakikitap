import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SporKayit } from "@/types/takip";

const SELECT =
  "id, tarih, aktivite, sure_dakika, mesafe_km, enerji_seviyesi, notlar, olusturma_tarihi";

function map(r: Record<string, unknown>): SporKayit {
  return {
    id: r.id as string,
    tarih: r.tarih as string,
    aktivite: r.aktivite as string,
    sure_dakika: typeof r.sure_dakika === "number" ? r.sure_dakika : null,
    mesafe_km:
      r.mesafe_km != null && r.mesafe_km !== ""
        ? Number(r.mesafe_km)
        : null,
    enerji_seviyesi:
      typeof r.enerji_seviyesi === "number" ? r.enerji_seviyesi : null,
    notlar: (r.notlar as string | null) ?? null,
    olusturma_tarihi: r.olusturma_tarihi as string,
  };
}

export async function listSpor(opts?: {
  from?: string;
  to?: string;
  limit?: number;
}): Promise<SporKayit[]> {
  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("spor_gunlugu")
      .select(SELECT)
      .order("tarih", { ascending: false });
    if (opts?.from) q = q.gte("tarih", opts.from);
    if (opts?.to) q = q.lte("tarih", opts.to);
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []).map((r) => map(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function createSpor(input: {
  tarih: string;
  aktivite: string;
  sure_dakika?: number | null;
  mesafe_km?: number | null;
  enerji_seviyesi?: number | null;
  notlar?: string | null;
}): Promise<SporKayit | { error: string }> {
  const aktivite = input.aktivite.trim();
  if (!aktivite) return { error: "Aktivite gerekli." };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("spor_gunlugu")
    .insert({
      tarih: input.tarih,
      aktivite,
      sure_dakika: input.sure_dakika ?? null,
      mesafe_km: input.mesafe_km ?? null,
      enerji_seviyesi: input.enerji_seviyesi ?? null,
      notlar: input.notlar?.trim() || null,
    })
    .select(SELECT)
    .single();
  if (error) return { error: error.message };
  return map(data as Record<string, unknown>);
}

export async function deleteSpor(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("spor_gunlugu").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}
