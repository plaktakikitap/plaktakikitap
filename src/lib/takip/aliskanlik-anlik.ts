import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { startOfIsoWeekISO } from "@/lib/date/istanbul";
import { AKSAM_ADIM_VARSAYILAN } from "@/lib/takip/aliskanlik-now";
import type {
  AliskanlikAltAdim,
  AliskanlikAksamKayit,
  AliskanlikCevreAlani,
  AliskanlikCevreAlaniKodu,
  AliskanlikDurtu,
  AliskanlikDurtuDurum,
  AliskanlikDurtuSebep,
} from "@/types/takip";

function publicDbError(message: string): string {
  if (/duplicate|unique/i.test(message)) return "Bu kayıt zaten var.";
  if (/violates check/i.test(message)) return "Geçersiz alan değeri.";
  return "İşlem tamamlanamadı.";
}

function asBoolMap(v: unknown): Record<string, boolean> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, boolean> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    out[k] = Boolean(val);
  }
  return out;
}

function asAdimlar(v: unknown): AliskanlikAltAdim[] {
  if (!Array.isArray(v)) return [...AKSAM_ADIM_VARSAYILAN];
  const out: AliskanlikAltAdim[] = [];
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.kod !== "string" || typeof o.ad !== "string") continue;
    if (!o.kod.trim() || !o.ad.trim()) continue;
    out.push({ kod: o.kod.trim(), ad: o.ad.trim() });
  }
  return out.length ? out : [...AKSAM_ADIM_VARSAYILAN];
}

function mapAksam(r: Record<string, unknown>): AliskanlikAksamKayit {
  return {
    id: r.id as string,
    tarih: r.tarih as string,
    adimlar: asBoolMap(r.adimlar),
    ilk_davranis: (r.ilk_davranis as string | null) ?? null,
    olusturma_tarihi: r.olusturma_tarihi as string,
    guncelleme_tarihi: (r.guncelleme_tarihi as string | null) ?? null,
  };
}

const CEVRE_ALAN: AliskanlikCevreAlaniKodu[] = [
  "yatak_odasi",
  "calisma_masasi",
  "mutfak",
  "canta",
  "telefon",
  "yolculuk",
];

function mapCevre(r: Record<string, unknown>): AliskanlikCevreAlani {
  const alan = CEVRE_ALAN.includes(r.alan as AliskanlikCevreAlaniKodu)
    ? (r.alan as AliskanlikCevreAlaniKodu)
    : "yatak_odasi";
  return {
    id: r.id as string,
    alan,
    desteklenen_davranis: (r.desteklenen_davranis as string | null) ?? null,
    gorunur_isaret: (r.gorunur_isaret as string | null) ?? null,
    kaldirilacak_engel: (r.kaldirilacak_engel as string | null) ?? null,
    surtunme: (r.surtunme as string | null) ?? null,
    haftanin_degisikligi: (r.haftanin_degisikligi as string | null) ?? null,
    bu_hafta_aktif: Boolean(r.bu_hafta_aktif),
    tamamlandi: Boolean(r.tamamlandi),
    aktif_hafta: (r.aktif_hafta as string | null) ?? null,
    guncelleme_tarihi: (r.guncelleme_tarihi as string | null) ?? null,
  };
}

const SEBEPLER: AliskanlikDurtuSebep[] = [
  "is",
  "paylasim",
  "mesaj",
  "merak",
  "can_sikintisi",
];
const DURUMLAR: AliskanlikDurtuDurum[] = [
  "bekliyor",
  "amac_tamamlandi",
  "istek_gecti",
  "hala_istiyorum",
  "alternatif_yapildi",
];

function mapDurtu(r: Record<string, unknown>): AliskanlikDurtu {
  return {
    id: r.id as string,
    tarih: r.tarih as string,
    saat: Number(r.saat) || 0,
    sebep: SEBEPLER.includes(r.sebep as AliskanlikDurtuSebep)
      ? (r.sebep as AliskanlikDurtuSebep)
      : "merak",
    amac: (r.amac as string | null) ?? null,
    alternatif: (r.alternatif as string | null) ?? null,
    durum: DURUMLAR.includes(r.durum as AliskanlikDurtuDurum)
      ? (r.durum as AliskanlikDurtuDurum)
      : "bekliyor",
    olusturma_tarihi: r.olusturma_tarihi as string,
    guncelleme_tarihi: (r.guncelleme_tarihi as string | null) ?? null,
  };
}

export async function getAksamSablon(): Promise<AliskanlikAltAdim[]> {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("aliskanlik_aksam_sablon")
      .select("adimlar")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return [...AKSAM_ADIM_VARSAYILAN];
    return asAdimlar(data.adimlar);
  } catch {
    return [...AKSAM_ADIM_VARSAYILAN];
  }
}

export async function saveAksamSablon(
  adimlar: AliskanlikAltAdim[]
): Promise<AliskanlikAltAdim[] | { error: string }> {
  const cleaned = asAdimlar(adimlar);
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("aliskanlik_aksam_sablon")
    .upsert({
      id: 1,
      adimlar: cleaned,
      guncelleme_tarihi: new Date().toISOString(),
    })
    .select("adimlar")
    .single();
  if (error) return { error: publicDbError(error.message) };
  return asAdimlar(data.adimlar);
}

export async function getAksamKayit(
  tarih: string
): Promise<AliskanlikAksamKayit | null> {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("aliskanlik_aksam_kayitlari")
      .select("*")
      .eq("tarih", tarih)
      .maybeSingle();
    if (error || !data) return null;
    return mapAksam(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function upsertAksamKayit(input: {
  tarih: string;
  adimlar?: Record<string, boolean>;
  adim_kod?: string;
  adim_deger?: boolean;
  ilk_davranis?: string | null;
}): Promise<AliskanlikAksamKayit | { error: string }> {
  const sb = createAdminClient();
  const mevcut = await getAksamKayit(input.tarih);
  const adimlar = { ...(mevcut?.adimlar ?? {}) };
  if (input.adimlar) Object.assign(adimlar, input.adimlar);
  if (input.adim_kod) adimlar[input.adim_kod] = Boolean(input.adim_deger);
  const { data, error } = await sb
    .from("aliskanlik_aksam_kayitlari")
    .upsert(
      {
        tarih: input.tarih,
        adimlar,
        ilk_davranis:
          input.ilk_davranis !== undefined
            ? input.ilk_davranis?.trim() || null
            : mevcut?.ilk_davranis ?? null,
        guncelleme_tarihi: new Date().toISOString(),
      },
      { onConflict: "tarih" }
    )
    .select("*")
    .single();
  if (error) return { error: publicDbError(error.message) };
  return mapAksam(data as Record<string, unknown>);
}

export async function listCevreAlanlari(
  todayISO: string
): Promise<AliskanlikCevreAlani[]> {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("aliskanlik_cevre_alanlari")
      .select("*")
      .order("alan");
    if (error || !data) return [];
    const hafta = startOfIsoWeekISO(todayISO);
    const mapped = data.map((r) => mapCevre(r as Record<string, unknown>));
    const stale = mapped.filter(
      (r) => r.bu_hafta_aktif && r.aktif_hafta && r.aktif_hafta !== hafta
    );
    if (stale.length === 0) return mapped;
    for (const row of stale) {
      await sb
        .from("aliskanlik_cevre_alanlari")
        .update({
          bu_hafta_aktif: false,
          tamamlandi: false,
          aktif_hafta: null,
          guncelleme_tarihi: new Date().toISOString(),
        })
        .eq("id", row.id);
    }
    return mapped.map((r) =>
      r.bu_hafta_aktif && r.aktif_hafta && r.aktif_hafta !== hafta
        ? { ...r, bu_hafta_aktif: false, tamamlandi: false, aktif_hafta: null }
        : r
    );
  } catch {
    return [];
  }
}

export async function updateCevreAlani(
  id: string,
  patch: Partial<{
    desteklenen_davranis: string | null;
    gorunur_isaret: string | null;
    kaldirilacak_engel: string | null;
    surtunme: string | null;
    haftanin_degisikligi: string | null;
    bu_hafta_aktif: boolean;
    tamamlandi: boolean;
  }>,
  todayISO: string
): Promise<AliskanlikCevreAlani | { error: string }> {
  const sb = createAdminClient();
  const hafta = startOfIsoWeekISO(todayISO);
  if (patch.bu_hafta_aktif === true) {
    await sb
      .from("aliskanlik_cevre_alanlari")
      .update({
        bu_hafta_aktif: false,
        guncelleme_tarihi: new Date().toISOString(),
      })
      .neq("id", id);
  }
  const row: Record<string, unknown> = {
    guncelleme_tarihi: new Date().toISOString(),
  };
  if (patch.desteklenen_davranis !== undefined)
    row.desteklenen_davranis = patch.desteklenen_davranis?.trim() || null;
  if (patch.gorunur_isaret !== undefined)
    row.gorunur_isaret = patch.gorunur_isaret?.trim() || null;
  if (patch.kaldirilacak_engel !== undefined)
    row.kaldirilacak_engel = patch.kaldirilacak_engel?.trim() || null;
  if (patch.surtunme !== undefined) row.surtunme = patch.surtunme?.trim() || null;
  if (patch.haftanin_degisikligi !== undefined)
    row.haftanin_degisikligi = patch.haftanin_degisikligi?.trim() || null;
  if (patch.bu_hafta_aktif !== undefined) {
    row.bu_hafta_aktif = patch.bu_hafta_aktif;
    row.aktif_hafta = patch.bu_hafta_aktif ? hafta : null;
    if (!patch.bu_hafta_aktif) row.tamamlandi = false;
  }
  if (patch.tamamlandi !== undefined) row.tamamlandi = patch.tamamlandi;

  const { data, error } = await sb
    .from("aliskanlik_cevre_alanlari")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { error: publicDbError(error.message) };
  return mapCevre(data as Record<string, unknown>);
}

export async function listDurtuler(fromISO: string): Promise<AliskanlikDurtu[]> {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("aliskanlik_durtuler")
      .select("*")
      .gte("tarih", fromISO)
      .order("olusturma_tarihi", { ascending: false })
      .limit(200);
    if (error || !data) return [];
    return data.map((r) => mapDurtu(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function createDurtu(input: {
  tarih: string;
  saat: number;
  sebep: AliskanlikDurtuSebep;
  amac?: string | null;
  alternatif?: string | null;
}): Promise<AliskanlikDurtu | { error: string }> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("aliskanlik_durtuler")
    .insert({
      tarih: input.tarih,
      saat: input.saat,
      sebep: input.sebep,
      amac: input.amac?.trim() || null,
      alternatif: input.alternatif?.trim() || null,
      durum: "bekliyor",
    })
    .select("*")
    .single();
  if (error) return { error: publicDbError(error.message) };
  return mapDurtu(data as Record<string, unknown>);
}

export async function updateDurtu(
  id: string,
  patch: {
    durum?: AliskanlikDurtuDurum;
    amac?: string | null;
    alternatif?: string | null;
  }
): Promise<AliskanlikDurtu | { error: string }> {
  const sb = createAdminClient();
  const row: Record<string, unknown> = {
    guncelleme_tarihi: new Date().toISOString(),
  };
  if (patch.durum) row.durum = patch.durum;
  if (patch.amac !== undefined) row.amac = patch.amac?.trim() || null;
  if (patch.alternatif !== undefined)
    row.alternatif = patch.alternatif?.trim() || null;
  const { data, error } = await sb
    .from("aliskanlik_durtuler")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { error: publicDbError(error.message) };
  return mapDurtu(data as Record<string, unknown>);
}
