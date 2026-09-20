import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SukurKayit } from "@/types/takip";

const SELECT = "id, tarih, madde_1, madde_2, madde_3, olusturma_tarihi";

function map(r: Record<string, unknown>): SukurKayit {
  return {
    id: r.id as string,
    tarih: r.tarih as string,
    madde_1: r.madde_1 as string,
    madde_2: r.madde_2 as string,
    madde_3: r.madde_3 as string,
    olusturma_tarihi: r.olusturma_tarihi as string,
  };
}

export async function listSukur(): Promise<SukurKayit[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sukur_gunlugu")
      .select(SELECT)
      .order("tarih", { ascending: false });
    if (error) return [];
    return (data ?? []).map((r) => map(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getSukurByTarih(
  tarih: string
): Promise<SukurKayit | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sukur_gunlugu")
      .select(SELECT)
      .eq("tarih", tarih)
      .maybeSingle();
    if (error || !data) return null;
    return map(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function upsertSukur(input: {
  tarih: string;
  madde_1: string;
  madde_2: string;
  madde_3: string;
}): Promise<SukurKayit | { error: string }> {
  const m1 = input.madde_1.trim();
  const m2 = input.madde_2.trim();
  const m3 = input.madde_3.trim();
  if (!m1 || !m2 || !m3) return { error: "Üç madde de zorunlu." };

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("sukur_gunlugu")
    .select("id")
    .eq("tarih", input.tarih)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("sukur_gunlugu")
      .update({ madde_1: m1, madde_2: m2, madde_3: m3 })
      .eq("id", existing.id)
      .select(SELECT)
      .single();
    if (error) return { error: error.message };
    return map(data as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from("sukur_gunlugu")
    .insert({
      tarih: input.tarih,
      madde_1: m1,
      madde_2: m2,
      madde_3: m3,
    })
    .select(SELECT)
    .single();
  if (error) return { error: error.message };
  return map(data as Record<string, unknown>);
}
