import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GunlukKayit, RuhHali } from "@/types/takip";

const SELECT =
  "id, tarih, icerik, ruh_hali, olusturma_tarihi, guncelleme_tarihi";

function map(r: Record<string, unknown>): GunlukKayit {
  const ruh = r.ruh_hali as string | null;
  return {
    id: r.id as string,
    tarih: r.tarih as string,
    icerik: r.icerik as string,
    ruh_hali:
      ruh === "iyi" || ruh === "orta" || ruh === "zor"
        ? (ruh as RuhHali)
        : null,
    olusturma_tarihi: r.olusturma_tarihi as string,
    guncelleme_tarihi: r.guncelleme_tarihi as string,
  };
}

export async function listGunluk(opts?: {
  limit?: number;
}): Promise<GunlukKayit[]> {
  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("gunluk")
      .select(SELECT)
      .order("tarih", { ascending: false });
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []).map((r) => map(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getGunlukByTarih(
  tarih: string
): Promise<GunlukKayit | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("gunluk")
      .select(SELECT)
      .eq("tarih", tarih)
      .maybeSingle();
    if (error || !data) return null;
    return map(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function searchGunluk(q: string): Promise<GunlukKayit[]> {
  const term = q.trim();
  if (!term) return listGunluk({ limit: 60 });
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("gunluk")
      .select(SELECT)
      .ilike("icerik", `%${term}%`)
      .order("tarih", { ascending: false })
      .limit(50);
    if (error) return [];
    return (data ?? []).map((r) => map(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function upsertGunluk(input: {
  tarih: string;
  icerik: string;
  ruh_hali?: RuhHali | null;
}): Promise<GunlukKayit | { error: string }> {
  const icerik = input.icerik.trim();
  if (!icerik) return { error: "İçerik boş olamaz." };
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("gunluk")
    .select("id")
    .eq("tarih", input.tarih)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("gunluk")
      .update({
        icerik,
        ruh_hali: input.ruh_hali ?? null,
      })
      .eq("id", existing.id)
      .select(SELECT)
      .single();
    if (error) return { error: error.message };
    return map(data as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from("gunluk")
    .insert({
      tarih: input.tarih,
      icerik,
      ruh_hali: input.ruh_hali ?? null,
    })
    .select(SELECT)
    .single();
  if (error) return { error: error.message };
  return map(data as Record<string, unknown>);
}
