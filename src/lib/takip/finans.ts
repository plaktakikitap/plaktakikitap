import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FinansKategori, FinansKayit, FinansTur } from "@/types/takip";

const KAYIT_SELECT =
  "id, tarih, tur, tutar, kategori, notlar, olusturma_tarihi";
const KAT_SELECT = "id, ad, tur, renk";

function mapKayit(r: Record<string, unknown>): FinansKayit {
  return {
    id: r.id as string,
    tarih: r.tarih as string,
    tur: (r.tur === "gelir" ? "gelir" : "gider") as FinansTur,
    tutar: Number(r.tutar),
    kategori: r.kategori as string,
    notlar: (r.notlar as string | null) ?? null,
    olusturma_tarihi: r.olusturma_tarihi as string,
  };
}

function mapKat(r: Record<string, unknown>): FinansKategori {
  return {
    id: r.id as string,
    ad: r.ad as string,
    tur: (r.tur === "gelir" ? "gelir" : "gider") as FinansTur,
    renk: (r.renk as string) || "#c9a65a",
  };
}

export async function listFinansKategoriler(): Promise<FinansKategori[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("finans_kategoriler")
      .select(KAT_SELECT)
      .order("ad");
    if (error) return [];
    return (data ?? []).map((r) => mapKat(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function createFinansKategori(input: {
  ad: string;
  tur: FinansTur;
  renk?: string;
}): Promise<FinansKategori | { error: string }> {
  const ad = input.ad.trim();
  if (!ad) return { error: "Kategori adı gerekli." };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("finans_kategoriler")
    .insert({
      ad,
      tur: input.tur,
      renk: input.renk?.trim() || "#c9a65a",
    })
    .select(KAT_SELECT)
    .single();
  if (error) return { error: error.message };
  return mapKat(data as Record<string, unknown>);
}

export async function deleteFinansKategori(
  id: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("finans_kategoriler")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function listFinansKayitlari(opts?: {
  from?: string;
  to?: string;
  limit?: number;
}): Promise<FinansKayit[]> {
  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("finans_kayitlari")
      .select(KAYIT_SELECT)
      .order("tarih", { ascending: false })
      .order("olusturma_tarihi", { ascending: false });
    if (opts?.from) q = q.gte("tarih", opts.from);
    if (opts?.to) q = q.lte("tarih", opts.to);
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []).map((r) => mapKayit(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function createFinansKayit(input: {
  tarih: string;
  tur: FinansTur;
  tutar: number;
  kategori: string;
  notlar?: string | null;
}): Promise<FinansKayit | { error: string }> {
  if (!input.kategori.trim()) return { error: "Kategori gerekli." };
  if (!Number.isFinite(input.tutar) || input.tutar <= 0)
    return { error: "Geçerli bir tutar gir." };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("finans_kayitlari")
    .insert({
      tarih: input.tarih,
      tur: input.tur,
      tutar: input.tutar,
      kategori: input.kategori.trim(),
      notlar: input.notlar?.trim() || null,
    })
    .select(KAYIT_SELECT)
    .single();
  if (error) return { error: error.message };
  return mapKayit(data as Record<string, unknown>);
}

export async function deleteFinansKayit(
  id: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("finans_kayitlari").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}
