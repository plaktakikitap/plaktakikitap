import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Not, NotRenk } from "@/types/kisisel";

export type { Not, NotRenk } from "@/types/kisisel";

const SELECT =
  "id, baslik, icerik, renk, etiket, tarih, olusturma_tarihi, guncelleme_tarihi";

const RENKLER: NotRenk[] = ["sari", "mavi", "yesil", "kirmizi", "mor"];

function normalizeRenk(v: unknown): NotRenk {
  return RENKLER.includes(v as NotRenk) ? (v as NotRenk) : "sari";
}

function mapRow(r: Record<string, unknown>): Not {
  return {
    id: r.id as string,
    baslik: r.baslik as string,
    icerik: (r.icerik as string | null) ?? null,
    renk: normalizeRenk(r.renk),
    etiket: Array.isArray(r.etiket) ? (r.etiket as string[]) : [],
    tarih: (r.tarih as string | null) ?? null,
    olusturma_tarihi: r.olusturma_tarihi as string,
    guncelleme_tarihi: r.guncelleme_tarihi as string,
  };
}

export async function listNotlar(): Promise<Not[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("notlar")
      .select(SELECT)
      .order("olusturma_tarihi", { ascending: false });
    if (error) return [];
    return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function createNot(input: {
  baslik: string;
  icerik?: string | null;
  renk?: NotRenk;
  etiket?: string[];
  tarih?: string | null;
}): Promise<Not | { error: string }> {
  const baslik = input.baslik.trim();
  if (!baslik) return { error: "Başlık zorunludur." };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notlar")
    .insert({
      baslik,
      icerik: input.icerik?.trim() || null,
      renk: normalizeRenk(input.renk),
      etiket: input.etiket ?? [],
      tarih: input.tarih?.trim() || null,
    })
    .select(SELECT)
    .single();
  if (error) return { error: error.message };
  return mapRow(data as Record<string, unknown>);
}

export async function updateNot(
  id: string,
  input: {
    baslik?: string;
    icerik?: string | null;
    renk?: NotRenk;
    etiket?: string[];
    tarih?: string | null;
  }
): Promise<Not | { error: string }> {
  const updates: Record<string, unknown> = {};
  if (input.baslik !== undefined) {
    const b = input.baslik.trim();
    if (!b) return { error: "Başlık zorunludur." };
    updates.baslik = b;
  }
  if (input.icerik !== undefined) updates.icerik = input.icerik?.trim() || null;
  if (input.renk !== undefined) updates.renk = normalizeRenk(input.renk);
  if (input.etiket !== undefined) updates.etiket = input.etiket;
  if (input.tarih !== undefined) updates.tarih = input.tarih?.trim() || null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notlar")
    .update(updates)
    .eq("id", id)
    .select(SELECT)
    .single();
  if (error) return { error: error.message };
  return mapRow(data as Record<string, unknown>);
}

export async function deleteNot(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("notlar").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}
