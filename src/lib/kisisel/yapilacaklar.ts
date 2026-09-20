import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Oncelik, Yapilacak } from "@/types/kisisel";

export type { Oncelik, Yapilacak } from "@/types/kisisel";

const SELECT =
  "id, baslik, tamamlandi, oncelik, bitis_tarihi, kategori, olusturma_tarihi";

const ONCELIKLER: Oncelik[] = ["acil", "normal", "bekleyebilir"];

function normalizeOncelik(v: unknown): Oncelik {
  return ONCELIKLER.includes(v as Oncelik) ? (v as Oncelik) : "normal";
}

function mapRow(r: Record<string, unknown>): Yapilacak {
  return {
    id: r.id as string,
    baslik: r.baslik as string,
    tamamlandi: Boolean(r.tamamlandi),
    oncelik: normalizeOncelik(r.oncelik),
    bitis_tarihi: (r.bitis_tarihi as string | null) ?? null,
    kategori: (r.kategori as string | null) ?? null,
    olusturma_tarihi: r.olusturma_tarihi as string,
  };
}

export async function listYapilacaklar(): Promise<Yapilacak[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("yapilacaklar")
      .select(SELECT)
      .order("olusturma_tarihi", { ascending: false });
    if (error) return [];
    return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function createYapilacak(input: {
  baslik: string;
  oncelik?: Oncelik;
  bitis_tarihi?: string | null;
  kategori?: string | null;
}): Promise<Yapilacak | { error: string }> {
  const baslik = input.baslik.trim();
  if (!baslik) return { error: "Başlık zorunludur." };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("yapilacaklar")
    .insert({
      baslik,
      oncelik: normalizeOncelik(input.oncelik),
      bitis_tarihi: input.bitis_tarihi?.trim() || null,
      kategori: input.kategori?.trim() || null,
      tamamlandi: false,
    })
    .select(SELECT)
    .single();
  if (error) return { error: error.message };
  return mapRow(data as Record<string, unknown>);
}

export async function updateYapilacak(
  id: string,
  input: {
    baslik?: string;
    tamamlandi?: boolean;
    oncelik?: Oncelik;
    bitis_tarihi?: string | null;
    kategori?: string | null;
  }
): Promise<Yapilacak | { error: string }> {
  const updates: Record<string, unknown> = {};
  if (input.baslik !== undefined) {
    const b = input.baslik.trim();
    if (!b) return { error: "Başlık zorunludur." };
    updates.baslik = b;
  }
  if (input.tamamlandi !== undefined) updates.tamamlandi = input.tamamlandi;
  if (input.oncelik !== undefined) updates.oncelik = normalizeOncelik(input.oncelik);
  if (input.bitis_tarihi !== undefined)
    updates.bitis_tarihi = input.bitis_tarihi?.trim() || null;
  if (input.kategori !== undefined)
    updates.kategori = input.kategori?.trim() || null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("yapilacaklar")
    .update(updates)
    .eq("id", id)
    .select(SELECT)
    .single();
  if (error) return { error: error.message };
  return mapRow(data as Record<string, unknown>);
}

export async function deleteYapilacak(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("yapilacaklar").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}
