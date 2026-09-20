import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";

export interface Karalama {
  id: string;
  baslik: string;
  icerik: string;
  slug: string;
  yayinda: boolean;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

export interface KaralamaVersiyon {
  id: string;
  karalama_id: string;
  baslik: string;
  icerik: string;
  degistiren_alan: string | null;
  versiyon_no: number;
  olusturma_tarihi: string;
}

const SELECT_COLS =
  "id, baslik, icerik, slug, yayinda, olusturma_tarihi, guncelleme_tarihi";

export async function getKaralamalarPublic(opts?: {
  limit?: number;
}): Promise<Karalama[]> {
  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("karalamalar")
      .select(SELECT_COLS)
      .eq("yayinda", true)
      .order("olusturma_tarihi", { ascending: false });
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as Karalama[];
  } catch {
    return [];
  }
}

/** Admin: yayında olmayanlar dahil */
export async function getKaralamalarAdmin(): Promise<Karalama[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("karalamalar")
      .select(SELECT_COLS)
      .order("olusturma_tarihi", { ascending: false });
    if (error) return [];
    return (data ?? []) as Karalama[];
  } catch {
    return [];
  }
}

export async function getKaralamaBySlug(
  slug: string,
  opts?: { includeDraft?: boolean }
): Promise<Karalama | null> {
  try {
    const supabase = createAdminClient();
    let q = supabase.from("karalamalar").select(SELECT_COLS).eq("slug", slug);
    if (!opts?.includeDraft) q = q.eq("yayinda", true);
    const { data, error } = await q.maybeSingle();
    if (error || !data) return null;
    return data as Karalama;
  } catch {
    return null;
  }
}

export interface KaralamaInsert {
  baslik: string;
  icerik: string;
  slug?: string;
  yayinda?: boolean;
}

export async function createKaralama(
  payload: KaralamaInsert
): Promise<Karalama | { error: string }> {
  const baslik = payload.baslik.trim();
  const icerik = payload.icerik.trim();
  if (!baslik) return { error: "Başlık gerekli." };
  if (!icerik) return { error: "İçerik gerekli." };

  let slug = (payload.slug?.trim() || slugify(baslik)).replace(/^\/+|\/+$/g, "");
  if (!slug) return { error: "Geçerli bir slug üretilemedi." };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("karalamalar")
    .insert({
      baslik,
      icerik,
      slug,
      yayinda: payload.yayinda ?? true,
    })
    .select(SELECT_COLS)
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Bu slug zaten kullanılıyor." };
    return { error: error.message || "Kaydedilemedi." };
  }
  return data as Karalama;
}

export interface KaralamaUpdate {
  baslik?: string;
  icerik?: string;
  slug?: string;
  yayinda?: boolean;
}

export async function updateKaralama(
  id: string,
  payload: KaralamaUpdate
): Promise<Karalama | { error: string }> {
  const supabase = createAdminClient();

  const { data: mevcut, error: fetchErr } = await supabase
    .from("karalamalar")
    .select("baslik, icerik")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr || !mevcut) return { error: "Karalama bulunamadı." };

  const updates: Record<string, unknown> = {
    guncelleme_tarihi: new Date().toISOString(),
  };
  if (payload.baslik !== undefined) {
    const baslik = payload.baslik.trim();
    if (!baslik) return { error: "Başlık gerekli." };
    updates.baslik = baslik;
  }
  if (payload.icerik !== undefined) {
    const icerik = payload.icerik.trim();
    if (!icerik) return { error: "İçerik gerekli." };
    updates.icerik = icerik;
  }
  if (payload.slug !== undefined) {
    const slug = payload.slug.trim() || slugify(String(updates.baslik ?? mevcut.baslik));
    if (!slug) return { error: "Geçerli bir slug gerekli." };
    updates.slug = slug;
  }
  if (payload.yayinda !== undefined) updates.yayinda = payload.yayinda;

  const baslikDegisti =
    updates.baslik !== undefined && updates.baslik !== mevcut.baslik;
  const icerikDegisti =
    updates.icerik !== undefined && updates.icerik !== mevcut.icerik;

  if (baslikDegisti || icerikDegisti) {
    const { count } = await supabase
      .from("karalama_versiyonlar")
      .select("*", { count: "exact", head: true })
      .eq("karalama_id", id);

    let degistiren_alan = "ikisi";
    if (baslikDegisti && !icerikDegisti) degistiren_alan = "baslik";
    else if (!baslikDegisti && icerikDegisti) degistiren_alan = "icerik";

    await supabase.from("karalama_versiyonlar").insert({
      karalama_id: id,
      baslik: mevcut.baslik,
      icerik: mevcut.icerik,
      degistiren_alan,
      versiyon_no: (count ?? 0) + 1,
    });
  }

  const { data, error } = await supabase
    .from("karalamalar")
    .update(updates)
    .eq("id", id)
    .select(SELECT_COLS)
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Bu slug zaten kullanılıyor." };
    return { error: error.message || "Güncellenemedi." };
  }
  return data as Karalama;
}

export async function getKaralamaVersiyonlar(
  karalamaId: string
): Promise<KaralamaVersiyon[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("karalama_versiyonlar")
      .select(
        "id, karalama_id, baslik, icerik, degistiren_alan, versiyon_no, olusturma_tarihi"
      )
      .eq("karalama_id", karalamaId)
      .order("versiyon_no", { ascending: false });
    if (error) return [];
    return (data ?? []) as KaralamaVersiyon[];
  } catch {
    return [];
  }
}

export async function deleteKaralama(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("karalamalar").delete().eq("id", id);
  return !error;
}
