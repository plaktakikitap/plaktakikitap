import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  DilKelime,
  DilKodu,
  DilNot,
  DilNotKategori,
  DilStats,
  DilZorluk,
} from "@/types/dil";

const KELIME_SELECT =
  "id, dil, kelime, anlam, ornek_cumle, telaffuz, arapca_yazi, zorluk, ogrenildi, tekrar_sayisi, son_tekrar, etiket, olusturma_tarihi";

const NOT_SELECT =
  "id, dil, baslik, icerik, kategori, olusturma_tarihi, guncelleme_tarihi";

const ZORLUKLAR: DilZorluk[] = ["kolay", "orta", "zor"];

function mapKelime(r: Record<string, unknown>): DilKelime {
  const z = r.zorluk as string;
  return {
    id: r.id as string,
    dil: r.dil as DilKodu,
    kelime: r.kelime as string,
    anlam: r.anlam as string,
    ornek_cumle: (r.ornek_cumle as string | null) ?? null,
    telaffuz: (r.telaffuz as string | null) ?? null,
    arapca_yazi: (r.arapca_yazi as string | null) ?? null,
    zorluk: ZORLUKLAR.includes(z as DilZorluk) ? (z as DilZorluk) : "orta",
    ogrenildi: Boolean(r.ogrenildi),
    tekrar_sayisi: typeof r.tekrar_sayisi === "number" ? r.tekrar_sayisi : 0,
    son_tekrar: (r.son_tekrar as string | null) ?? null,
    etiket: Array.isArray(r.etiket) ? (r.etiket as string[]) : [],
    olusturma_tarihi: r.olusturma_tarihi as string,
  };
}

function mapNot(r: Record<string, unknown>): DilNot {
  const k = r.kategori as string | null;
  return {
    id: r.id as string,
    dil: r.dil as DilKodu,
    baslik: r.baslik as string,
    icerik: r.icerik as string,
    kategori:
      k === "gramer" || k === "telaffuz" || k === "deyim" || k === "genel"
        ? (k as DilNotKategori)
        : null,
    olusturma_tarihi: r.olusturma_tarihi as string,
    guncelleme_tarihi: r.guncelleme_tarihi as string,
  };
}

export type KelimeListOpts = {
  dil: DilKodu;
  q?: string;
  etiket?: string;
  zorluk?: DilZorluk;
  ogrenildi?: "all" | "true" | "false";
  sort?: "yeni" | "alfa" | "tekrar";
  limit?: number;
  offset?: number;
};

export async function listDilKelimeler(
  opts: KelimeListOpts
): Promise<{ items: DilKelime[]; total: number }> {
  try {
    const supabase = createAdminClient();
    const limit = Math.min(opts.limit ?? 40, 100);
    const offset = opts.offset ?? 0;

    let q = supabase
      .from("dil_kelimeler")
      .select(KELIME_SELECT, { count: "exact" })
      .eq("dil", opts.dil);

    if (opts.q?.trim()) {
      const term = opts.q.trim();
      q = q.or(
        `kelime.ilike.%${term}%,anlam.ilike.%${term}%,telaffuz.ilike.%${term}%,arapca_yazi.ilike.%${term}%`
      );
    }
    if (opts.etiket) q = q.contains("etiket", [opts.etiket]);
    if (opts.zorluk) q = q.eq("zorluk", opts.zorluk);
    if (opts.ogrenildi === "true") q = q.eq("ogrenildi", true);
    if (opts.ogrenildi === "false") q = q.eq("ogrenildi", false);

    if (opts.sort === "alfa") {
      q = q.order("kelime", { ascending: true });
    } else if (opts.sort === "tekrar") {
      q = q
        .order("tekrar_sayisi", { ascending: true })
        .order("olusturma_tarihi", { ascending: false });
    } else {
      q = q.order("olusturma_tarihi", { ascending: false });
    }

    q = q.range(offset, offset + limit - 1);
    const { data, error, count } = await q;
    if (error) return { items: [], total: 0 };
    return {
      items: (data ?? []).map((r) => mapKelime(r as Record<string, unknown>)),
      total: count ?? 0,
    };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function getDilStats(dil: DilKodu): Promise<DilStats> {
  try {
    const supabase = createAdminClient();
    const [{ count: kelime }, { count: ogrenilen }, { count: notlar }] =
      await Promise.all([
        supabase
          .from("dil_kelimeler")
          .select("id", { count: "exact", head: true })
          .eq("dil", dil),
        supabase
          .from("dil_kelimeler")
          .select("id", { count: "exact", head: true })
          .eq("dil", dil)
          .eq("ogrenildi", true),
        supabase
          .from("dil_notlar")
          .select("id", { count: "exact", head: true })
          .eq("dil", dil),
      ]);
    return {
      kelime_sayisi: kelime ?? 0,
      ogrenilen: ogrenilen ?? 0,
      not_sayisi: notlar ?? 0,
    };
  } catch {
    return { kelime_sayisi: 0, ogrenilen: 0, not_sayisi: 0 };
  }
}

export async function createDilKelime(input: {
  dil: DilKodu;
  kelime: string;
  anlam: string;
  ornek_cumle?: string | null;
  telaffuz?: string | null;
  arapca_yazi?: string | null;
  zorluk?: DilZorluk;
  etiket?: string[];
}): Promise<DilKelime | { error: string }> {
  const kelime = input.kelime.trim();
  const anlam = input.anlam.trim();
  if (!kelime || !anlam) return { error: "Kelime ve anlam zorunlu." };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("dil_kelimeler")
    .insert({
      dil: input.dil,
      kelime,
      anlam,
      ornek_cumle: input.ornek_cumle?.trim() || null,
      telaffuz: input.telaffuz?.trim() || null,
      arapca_yazi: input.arapca_yazi?.trim() || null,
      zorluk: input.zorluk ?? "orta",
      etiket: input.etiket ?? [],
    })
    .select(KELIME_SELECT)
    .single();
  if (error) return { error: error.message };
  return mapKelime(data as Record<string, unknown>);
}

export async function updateDilKelime(
  id: string,
  input: Partial<{
    kelime: string;
    anlam: string;
    ornek_cumle: string | null;
    telaffuz: string | null;
    arapca_yazi: string | null;
    zorluk: DilZorluk;
    etiket: string[];
    ogrenildi: boolean;
    tekrar_sayisi: number;
    son_tekrar: string | null;
  }>
): Promise<DilKelime | { error: string }> {
  const updates: Record<string, unknown> = {};
  if (input.kelime !== undefined) updates.kelime = input.kelime.trim();
  if (input.anlam !== undefined) updates.anlam = input.anlam.trim();
  if (input.ornek_cumle !== undefined)
    updates.ornek_cumle = input.ornek_cumle?.trim() || null;
  if (input.telaffuz !== undefined)
    updates.telaffuz = input.telaffuz?.trim() || null;
  if (input.arapca_yazi !== undefined)
    updates.arapca_yazi = input.arapca_yazi?.trim() || null;
  if (input.zorluk !== undefined) updates.zorluk = input.zorluk;
  if (input.etiket !== undefined) updates.etiket = input.etiket;
  if (input.ogrenildi !== undefined) updates.ogrenildi = input.ogrenildi;
  if (input.tekrar_sayisi !== undefined)
    updates.tekrar_sayisi = input.tekrar_sayisi;
  if (input.son_tekrar !== undefined) updates.son_tekrar = input.son_tekrar;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("dil_kelimeler")
    .update(updates)
    .eq("id", id)
    .select(KELIME_SELECT)
    .single();
  if (error) return { error: error.message };
  return mapKelime(data as Record<string, unknown>);
}

export async function deleteDilKelime(
  id: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("dil_kelimeler").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

/** Flashcard: öğrenilmemişler önce, az tekrar edilen */
export async function listFlashcardKelimeler(
  dil: DilKodu,
  opts?: { onlyUnknown?: boolean; onlyMissed?: boolean; ids?: string[] }
): Promise<DilKelime[]> {
  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("dil_kelimeler")
      .select(KELIME_SELECT)
      .eq("dil", dil)
      .order("tekrar_sayisi", { ascending: true })
      .order("olusturma_tarihi", { ascending: false })
      .limit(200);

    if (opts?.onlyUnknown) q = q.eq("ogrenildi", false);
    if (opts?.ids?.length) q = q.in("id", opts.ids);

    const { data, error } = await q;
    if (error) return [];
    let items = (data ?? []).map((r) => mapKelime(r as Record<string, unknown>));
    // shuffle lightly but keep low-tekrar first buckets
    items = items.sort((a, b) => {
      if (a.ogrenildi !== b.ogrenildi) return a.ogrenildi ? 1 : -1;
      if (a.tekrar_sayisi !== b.tekrar_sayisi)
        return a.tekrar_sayisi - b.tekrar_sayisi;
      return Math.random() - 0.5;
    });
    return items;
  } catch {
    return [];
  }
}

export async function listDilNotlar(
  dil: DilKodu,
  kategori?: DilNotKategori | null
): Promise<DilNot[]> {
  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("dil_notlar")
      .select(NOT_SELECT)
      .eq("dil", dil)
      .order("guncelleme_tarihi", { ascending: false });
    if (kategori) q = q.eq("kategori", kategori);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []).map((r) => mapNot(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function createDilNot(input: {
  dil: DilKodu;
  baslik: string;
  icerik: string;
  kategori?: DilNotKategori | null;
}): Promise<DilNot | { error: string }> {
  const baslik = input.baslik.trim();
  const icerik = input.icerik.trim();
  if (!baslik || !icerik) return { error: "Başlık ve içerik zorunlu." };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("dil_notlar")
    .insert({
      dil: input.dil,
      baslik,
      icerik,
      kategori: input.kategori ?? null,
    })
    .select(NOT_SELECT)
    .single();
  if (error) return { error: error.message };
  return mapNot(data as Record<string, unknown>);
}

export async function updateDilNot(
  id: string,
  input: {
    baslik?: string;
    icerik?: string;
    kategori?: DilNotKategori | null;
  }
): Promise<DilNot | { error: string }> {
  const updates: Record<string, unknown> = {};
  if (input.baslik !== undefined) updates.baslik = input.baslik.trim();
  if (input.icerik !== undefined) updates.icerik = input.icerik.trim();
  if (input.kategori !== undefined) updates.kategori = input.kategori;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("dil_notlar")
    .update(updates)
    .eq("id", id)
    .select(NOT_SELECT)
    .single();
  if (error) return { error: error.message };
  return mapNot(data as Record<string, unknown>);
}

export async function deleteDilNot(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("dil_notlar").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}
