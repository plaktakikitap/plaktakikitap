import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  BeslenmeAiAnaliz,
  BeslenmeKayit,
  BeslenmeOgun,
} from "@/types/takip";

const SELECT = "id, tarih, ogun, yenen, ai_analiz, olusturma_tarihi";
const OGUNLER: BeslenmeOgun[] = ["sabah", "ogle", "aksam", "ara_ogun"];

function map(r: Record<string, unknown>): BeslenmeKayit {
  return {
    id: r.id as string,
    tarih: r.tarih as string,
    ogun: (OGUNLER.includes(r.ogun as BeslenmeOgun)
      ? r.ogun
      : "ogle") as BeslenmeOgun,
    yenen: r.yenen as string,
    ai_analiz: (r.ai_analiz as BeslenmeAiAnaliz | null) ?? null,
    olusturma_tarihi: r.olusturma_tarihi as string,
  };
}

export async function listBeslenme(opts?: {
  from?: string;
  to?: string;
  limit?: number;
}): Promise<BeslenmeKayit[]> {
  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("beslenme_gunlugu")
      .select(SELECT)
      .order("tarih", { ascending: false })
      .order("olusturma_tarihi", { ascending: false });
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

export async function createBeslenme(input: {
  tarih: string;
  ogun: BeslenmeOgun;
  yenen: string;
  ai_analiz?: BeslenmeAiAnaliz | null;
}): Promise<BeslenmeKayit | { error: string }> {
  const yenen = input.yenen.trim();
  if (!yenen) return { error: "Ne yediğini yaz." };
  if (!OGUNLER.includes(input.ogun)) return { error: "Geçersiz öğün." };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("beslenme_gunlugu")
    .insert({
      tarih: input.tarih,
      ogun: input.ogun,
      yenen,
      ai_analiz: input.ai_analiz ?? null,
    })
    .select(SELECT)
    .single();
  if (error) return { error: error.message };
  return map(data as Record<string, unknown>);
}

export async function deleteBeslenme(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("beslenme_gunlugu").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}
