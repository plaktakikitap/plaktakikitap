import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { durumFromTamamlandi } from "@/lib/takip/aliskanlik-done";
import { deriveDurum } from "@/lib/takip/aliskanlik-progress";
import { HAZIR_PLAN, previewHazirPlan } from "@/lib/takip/aliskanlik-plan";
import type {
  Aliskanlik,
  AliskanlikAltAdim,
  AliskanlikGunModu,
  AliskanlikGunu,
  AliskanlikHaftalikDegerlendirme,
  AliskanlikKayit,
  AliskanlikKayitDurum,
  AliskanlikKayitEkstra,
  AliskanlikOzelTuru,
  AliskanlikProgramTuru,
  AliskanlikSorunTuru,
  AliskanlikZamanDilimi,
} from "@/types/takip";

export { calcStreak } from "@/lib/takip/aliskanlik-streak";

const HABIT_SELECT =
  "id, ad, aciklama, aktif, kategori, kimlik_ifadesi, program_turu, hedef_gunler, hedef_siklik, birim, minimum_deger, hedef_deger, tetikleyici, zaman_dilimi, siradaki_adim, zorluk_seviyesi, sira, renk, ikon, ozel_tur, arsivlendi, plan_kodu, asama, alt_adimlar, karsilayan_aliskanlik_id, olusturma_tarihi, guncelleme_tarihi";
const HABIT_SELECT_LEGACY = "id, ad, aciklama, aktif, olusturma_tarihi";
const LOG_SELECT =
  "id, aliskanlik_id, tarih, tamamlandi, durum, deger, notlar, gun_modu, kayit_zamani, alt_adimlar, ekstra";
const LOG_SELECT_LEGACY = "id, aliskanlik_id, tarih, tamamlandi";

function isMissingColumn(error: { message?: string } | null): boolean {
  const m = error?.message ?? "";
  return /does not exist|schema cache/i.test(m);
}

function publicDbError(message: string): string {
  if (/duplicate|unique/i.test(message)) return "Bu kayıt zaten var.";
  if (/violates check/i.test(message)) return "Geçersiz alan değeri.";
  return "İşlem tamamlanamadı.";
}

const PROGRAM_TURLERI: AliskanlikProgramTuru[] = [
  "gunluk",
  "belirli_gunler",
  "iki_gunde_bir",
  "haftada_x",
  "ayda_x",
  "esnek",
  "haftalik",
  "challenge",
];
const ZAMAN_DILIMLERI: AliskanlikZamanDilimi[] = [
  "sabah",
  "gunduz",
  "aksam",
  "gun_boyu",
  "yolculuk",
  "ogle",
  "gece",
];
const KAYIT_DURUMLARI: AliskanlikKayitDurum[] = [
  "minimum",
  "hedef",
  "bonus",
  "yapilmadi",
  "planli_degil",
];
const GUN_MODLARI: AliskanlikGunModu[] = ["normal", "yogun", "toparlanma"];
const OZEL_TURLER: AliskanlikOzelTuru[] = [
  "namaz",
  "ogun",
  "dil",
  "yolculuk",
  "icerik_hatti",
  "sosyal",
  "uyku",
];
const SORUN_TURLERI: AliskanlikSorunTuru[] = [
  "zaman",
  "ortam",
  "tetikleyici",
  "zorluk",
  "enerji",
];

function asNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function asAltAdimlar(v: unknown): AliskanlikAltAdim[] {
  if (!Array.isArray(v)) return [];
  const out: AliskanlikAltAdim[] = [];
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.kod !== "string" || typeof o.ad !== "string") continue;
    const row: AliskanlikAltAdim = { kod: o.kod, ad: o.ad };
    if (typeof o.grup === "string") row.grup = o.grup;
    out.push(row);
  }
  return out;
}

function asBoolMap(v: unknown): Record<string, boolean> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, boolean> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    out[k] = Boolean(val);
  }
  return out;
}

function asEkstra(v: unknown): AliskanlikKayitEkstra {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  return v as AliskanlikKayitEkstra;
}

export function mapHabit(r: Record<string, unknown>): Aliskanlik {
  const gunler = Array.isArray(r.hedef_gunler)
    ? r.hedef_gunler.map((g) => Number(g)).filter((g) => Number.isFinite(g))
    : [];
  return {
    id: r.id as string,
    ad: r.ad as string,
    aciklama: (r.aciklama as string | null) ?? null,
    aktif: Boolean(r.aktif),
    kategori: (r.kategori as string | null) ?? null,
    kimlik_ifadesi: (r.kimlik_ifadesi as string | null) ?? null,
    program_turu: PROGRAM_TURLERI.includes(
      r.program_turu as AliskanlikProgramTuru
    )
      ? (r.program_turu as AliskanlikProgramTuru)
      : null,
    hedef_gunler: gunler,
    hedef_siklik: asNum(r.hedef_siklik),
    birim: (r.birim as string | null) ?? null,
    minimum_deger: asNum(r.minimum_deger),
    hedef_deger: asNum(r.hedef_deger),
    tetikleyici: (r.tetikleyici as string | null) ?? null,
    zaman_dilimi: ZAMAN_DILIMLERI.includes(
      r.zaman_dilimi as AliskanlikZamanDilimi
    )
      ? (r.zaman_dilimi as AliskanlikZamanDilimi)
      : null,
    siradaki_adim: (r.siradaki_adim as string | null) ?? null,
    zorluk_seviyesi: asNum(r.zorluk_seviyesi),
    sira: typeof r.sira === "number" ? r.sira : 0,
    renk: typeof r.renk === "string" && r.renk ? r.renk : "#b8934a",
    ikon: (r.ikon as string | null) ?? null,
    ozel_tur: OZEL_TURLER.includes(r.ozel_tur as AliskanlikOzelTuru)
      ? (r.ozel_tur as AliskanlikOzelTuru)
      : null,
    arsivlendi: Boolean(r.arsivlendi),
    plan_kodu: (r.plan_kodu as string | null) ?? null,
    asama: asNum(r.asama),
    alt_adimlar: asAltAdimlar(r.alt_adimlar),
    karsilayan_aliskanlik_id:
      (r.karsilayan_aliskanlik_id as string | null) ?? null,
    olusturma_tarihi: r.olusturma_tarihi as string,
    guncelleme_tarihi: (r.guncelleme_tarihi as string | null) ?? null,
  };
}

function mapLog(r: Record<string, unknown>): AliskanlikKayit {
  const durum = KAYIT_DURUMLARI.includes(r.durum as AliskanlikKayitDurum)
    ? (r.durum as AliskanlikKayitDurum)
    : null;
  const gun_modu = GUN_MODLARI.includes(r.gun_modu as AliskanlikGunModu)
    ? (r.gun_modu as AliskanlikGunModu)
    : null;
  return {
    id: r.id as string,
    aliskanlik_id: r.aliskanlik_id as string,
    tarih: r.tarih as string,
    tamamlandi: Boolean(r.tamamlandi),
    durum,
    deger: asNum(r.deger),
    notlar: (r.notlar as string | null) ?? null,
    gun_modu,
    kayit_zamani: (r.kayit_zamani as string | null) ?? null,
    alt_adimlar: asBoolMap(r.alt_adimlar),
    ekstra: asEkstra(r.ekstra),
  };
}

function mapGunu(r: Record<string, unknown>): AliskanlikGunu {
  return {
    id: r.id as string,
    tarih: r.tarih as string,
    gun_modu: GUN_MODLARI.includes(r.gun_modu as AliskanlikGunModu)
      ? (r.gun_modu as AliskanlikGunModu)
      : "normal",
    notlar: (r.notlar as string | null) ?? null,
    olusturma_tarihi: r.olusturma_tarihi as string,
    guncelleme_tarihi: (r.guncelleme_tarihi as string | null) ?? null,
  };
}

function mapReview(r: Record<string, unknown>): AliskanlikHaftalikDegerlendirme {
  return {
    id: r.id as string,
    hafta_baslangici: r.hafta_baslangici as string,
    dogal_akan: (r.dogal_akan as string | null) ?? null,
    zorlanan: (r.zorlanan as string | null) ?? null,
    sorun_turu: SORUN_TURLERI.includes(r.sorun_turu as AliskanlikSorunTuru)
      ? (r.sorun_turu as AliskanlikSorunTuru)
      : null,
    buyuk_hedef: (r.buyuk_hedef as string | null) ?? null,
    kucultme: (r.kucultme as string | null) ?? null,
    ust_seviye: (r.ust_seviye as string | null) ?? null,
    notlar: (r.notlar as string | null) ?? null,
    olusturma_tarihi: r.olusturma_tarihi as string,
    guncelleme_tarihi: (r.guncelleme_tarihi as string | null) ?? null,
  };
}

export type HabitWrite = {
  ad: string;
  aciklama?: string | null;
  kategori?: string | null;
  kimlik_ifadesi?: string | null;
  program_turu?: AliskanlikProgramTuru | null;
  hedef_gunler?: number[];
  hedef_siklik?: number | null;
  birim?: string | null;
  minimum_deger?: number | null;
  hedef_deger?: number | null;
  tetikleyici?: string | null;
  zaman_dilimi?: AliskanlikZamanDilimi | null;
  siradaki_adim?: string | null;
  zorluk_seviyesi?: number | null;
  sira?: number | null;
  renk?: string | null;
  ikon?: string | null;
  ozel_tur?: AliskanlikOzelTuru | null;
  alt_adimlar?: AliskanlikAltAdim[];
  karsilayan_aliskanlik_id?: string | null;
  asama?: number | null;
  plan_kodu?: string | null;
  aktif?: boolean;
};

function habitRow(input: HabitWrite): Record<string, unknown> {
  const row: Record<string, unknown> = {
    ad: input.ad.trim(),
    aciklama: input.aciklama?.trim() || null,
    kategori: input.kategori?.trim() || null,
    kimlik_ifadesi: input.kimlik_ifadesi?.trim() || null,
    program_turu: input.program_turu ?? "gunluk",
    hedef_gunler: input.hedef_gunler ?? [],
    hedef_siklik: input.hedef_siklik ?? null,
    birim: input.birim?.trim() || null,
    minimum_deger: input.minimum_deger ?? null,
    hedef_deger: input.hedef_deger ?? null,
    tetikleyici: input.tetikleyici?.trim() || null,
    zaman_dilimi: input.zaman_dilimi ?? "gun_boyu",
    siradaki_adim: input.siradaki_adim?.trim() || null,
    zorluk_seviyesi: input.zorluk_seviyesi ?? null,
    sira: input.sira ?? 0,
    renk: input.renk?.trim() || "#b8934a",
    ikon: input.ikon?.trim() || null,
    ozel_tur: input.ozel_tur ?? null,
    alt_adimlar: input.alt_adimlar ?? [],
    karsilayan_aliskanlik_id: input.karsilayan_aliskanlik_id ?? null,
    asama: input.asama ?? null,
    guncelleme_tarihi: new Date().toISOString(),
  };
  if (input.plan_kodu) row.plan_kodu = input.plan_kodu;
  if (input.aktif != null) row.aktif = input.aktif;
  return row;
}

export async function listAliskanliklar(opts?: {
  includeInactive?: boolean;
  includeArchived?: boolean;
}): Promise<Aliskanlik[]> {
  try {
    const supabase = createAdminClient();
    const run = async (select: string, extra: boolean) => {
      let q = supabase.from("aliskanliklar").select(select);
      if (extra) {
        q = q.order("sira", { ascending: true });
        if (!opts?.includeArchived) q = q.eq("arsivlendi", false);
      }
      q = q.order("olusturma_tarihi", { ascending: true });
      if (!opts?.includeInactive) q = q.eq("aktif", true);
      return q;
    };
    let { data, error } = await run(HABIT_SELECT, true);
    if (error && isMissingColumn(error)) {
      ({ data, error } = await run(HABIT_SELECT_LEGACY, false));
    }
    if (error) return [];
    return (data ?? []).map((r) =>
      mapHabit(r as unknown as Record<string, unknown>)
    );
  } catch {
    return [];
  }
}

export async function createAliskanlik(
  input: HabitWrite
): Promise<Aliskanlik | { error: string }> {
  const ad = input.ad.trim();
  if (!ad) return { error: "Alışkanlık adı gerekli." };
  const supabase = createAdminClient();
  const row = habitRow({ ...input, ad });
  row.aktif = input.aktif ?? true;
  row.arsivlendi = false;
  let { data, error } = await supabase
    .from("aliskanliklar")
    .insert(row)
    .select(HABIT_SELECT)
    .single();
  if (error && isMissingColumn(error)) {
    ({ data, error } = await supabase
      .from("aliskanliklar")
      .insert({ ad, aciklama: row.aciklama, aktif: true })
      .select(HABIT_SELECT_LEGACY)
      .single());
  }
  if (error) return { error: publicDbError(error.message) };
  return mapHabit(data as Record<string, unknown>);
}

export async function updateAliskanlik(
  id: string,
  input: Partial<HabitWrite>
): Promise<Aliskanlik | { error: string }> {
  const supabase = createAdminClient();
  const row: Record<string, unknown> = {
    guncelleme_tarihi: new Date().toISOString(),
  };
  if (input.ad != null) row.ad = input.ad.trim();
  if (input.aciklama !== undefined) row.aciklama = input.aciklama?.trim() || null;
  if (input.kategori !== undefined) row.kategori = input.kategori?.trim() || null;
  if (input.kimlik_ifadesi !== undefined)
    row.kimlik_ifadesi = input.kimlik_ifadesi?.trim() || null;
  if (input.program_turu !== undefined) row.program_turu = input.program_turu;
  if (input.hedef_gunler !== undefined) row.hedef_gunler = input.hedef_gunler;
  if (input.hedef_siklik !== undefined) row.hedef_siklik = input.hedef_siklik;
  if (input.birim !== undefined) row.birim = input.birim?.trim() || null;
  if (input.minimum_deger !== undefined) row.minimum_deger = input.minimum_deger;
  if (input.hedef_deger !== undefined) row.hedef_deger = input.hedef_deger;
  if (input.tetikleyici !== undefined)
    row.tetikleyici = input.tetikleyici?.trim() || null;
  if (input.zaman_dilimi !== undefined) row.zaman_dilimi = input.zaman_dilimi;
  if (input.siradaki_adim !== undefined)
    row.siradaki_adim = input.siradaki_adim?.trim() || null;
  if (input.zorluk_seviyesi !== undefined)
    row.zorluk_seviyesi = input.zorluk_seviyesi;
  if (input.sira !== undefined) row.sira = input.sira ?? 0;
  if (input.renk !== undefined) row.renk = input.renk?.trim() || "#b8934a";
  if (input.ikon !== undefined) row.ikon = input.ikon?.trim() || null;
  if (input.ozel_tur !== undefined) row.ozel_tur = input.ozel_tur;
  if (input.alt_adimlar !== undefined) row.alt_adimlar = input.alt_adimlar;
  if (input.karsilayan_aliskanlik_id !== undefined)
    row.karsilayan_aliskanlik_id = input.karsilayan_aliskanlik_id;
  if (input.asama !== undefined) row.asama = input.asama;

  const { data, error } = await supabase
    .from("aliskanliklar")
    .update(row)
    .eq("id", id)
    .select(HABIT_SELECT)
    .single();
  if (error) return { error: publicDbError(error.message) };
  return mapHabit(data as Record<string, unknown>);
}

export async function setAliskanlikAktif(
  id: string,
  aktif: boolean
): Promise<Aliskanlik | { error: string }> {
  const supabase = createAdminClient();
  let { data, error } = await supabase
    .from("aliskanliklar")
    .update({ aktif, guncelleme_tarihi: new Date().toISOString() })
    .eq("id", id)
    .select(HABIT_SELECT)
    .single();
  if (error && isMissingColumn(error)) {
    ({ data, error } = await supabase
      .from("aliskanliklar")
      .update({ aktif })
      .eq("id", id)
      .select(HABIT_SELECT_LEGACY)
      .single());
  }
  if (error) return { error: publicDbError(error.message) };
  return mapHabit(data as Record<string, unknown>);
}

export async function setAliskanlikArsiv(
  id: string,
  arsivlendi: boolean
): Promise<Aliskanlik | { error: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("aliskanliklar")
    .update({
      arsivlendi,
      aktif: arsivlendi ? false : true,
      guncelleme_tarihi: new Date().toISOString(),
    })
    .eq("id", id)
    .select(HABIT_SELECT)
    .single();
  if (error) return { error: publicDbError(error.message) };
  return mapHabit(data as Record<string, unknown>);
}

export async function listAliskanlikKayitlari(opts?: {
  from?: string;
  to?: string;
}): Promise<AliskanlikKayit[]> {
  try {
    const supabase = createAdminClient();
    const run = (select: string) => {
      let q = supabase.from("aliskanlik_kayitlari").select(select);
      if (opts?.from) q = q.gte("tarih", opts.from);
      if (opts?.to) q = q.lte("tarih", opts.to);
      return q;
    };
    let { data, error } = await run(LOG_SELECT);
    if (error && isMissingColumn(error)) {
      ({ data, error } = await run(LOG_SELECT_LEGACY));
    }
    if (error) return [];
    return (data ?? []).map((r) =>
      mapLog(r as unknown as Record<string, unknown>)
    );
  } catch {
    return [];
  }
}

async function findKayit(
  aliskanlik_id: string,
  tarih: string
): Promise<AliskanlikKayit | null> {
  const supabase = createAdminClient();
  let q = await supabase
    .from("aliskanlik_kayitlari")
    .select(LOG_SELECT)
    .eq("aliskanlik_id", aliskanlik_id)
    .eq("tarih", tarih)
    .maybeSingle();
  if (q.error && isMissingColumn(q.error)) {
    q = await supabase
      .from("aliskanlik_kayitlari")
      .select(LOG_SELECT_LEGACY)
      .eq("aliskanlik_id", aliskanlik_id)
      .eq("tarih", tarih)
      .maybeSingle();
  }
  if (!q.data) return null;
  return mapLog(q.data as Record<string, unknown>);
}

export async function upsertAliskanlikKayit(input: {
  aliskanlik_id: string;
  tarih: string;
  tamamlandi?: boolean;
  durum?: AliskanlikKayitDurum | null;
  deger?: number | null;
  notlar?: string | null;
  gun_modu?: AliskanlikGunModu | null;
  alt_adim_kod?: string;
  alt_adim_deger?: boolean;
  alt_adimlar?: Record<string, boolean>;
  ekstra?: AliskanlikKayitEkstra;
  geri_al?: boolean;
}): Promise<AliskanlikKayit | { error: string }> {
  const supabase = createAdminClient();
  const habits = await listAliskanliklar({ includeInactive: true, includeArchived: true });
  const habit = habits.find((h) => h.id === input.aliskanlik_id);
  const existing = await findKayit(input.aliskanlik_id, input.tarih);

  if (input.geri_al) {
    const payload = {
      tamamlandi: false,
      durum: "yapilmadi" as const,
      deger: null,
      notlar: existing?.notlar ?? null,
      kayit_zamani: new Date().toISOString(),
      alt_adimlar: {},
      ekstra: existing?.ekstra ?? {},
    };
    if (!existing) {
      return {
        id: "",
        aliskanlik_id: input.aliskanlik_id,
        tarih: input.tarih,
        tamamlandi: false,
        durum: "yapilmadi",
        deger: null,
        notlar: null,
        gun_modu: null,
        kayit_zamani: null,
        alt_adimlar: {},
        ekstra: {},
      };
    }
    let { data, error } = await supabase
      .from("aliskanlik_kayitlari")
      .update(payload)
      .eq("id", existing.id)
      .select(LOG_SELECT)
      .single();
    if (error && isMissingColumn(error)) {
      ({ data, error } = await supabase
        .from("aliskanlik_kayitlari")
        .update({ tamamlandi: false })
        .eq("id", existing.id)
        .select(LOG_SELECT_LEGACY)
        .single());
    }
    if (error) return { error: publicDbError(error.message) };
    return mapLog(data as Record<string, unknown>);
  }

  const alt = {
    ...(existing?.alt_adimlar ?? {}),
    ...(input.alt_adimlar ?? {}),
  };
  if (input.alt_adim_kod) {
    alt[input.alt_adim_kod] = Boolean(input.alt_adim_deger);
  }
  const ekstra = { ...(existing?.ekstra ?? {}), ...(input.ekstra ?? {}) };
  const deger =
    input.deger !== undefined ? input.deger : (existing?.deger ?? null);

  let durum: AliskanlikKayitDurum;
  if (input.durum) {
    durum = input.durum;
  } else if (input.tamamlandi != null && !input.alt_adim_kod && input.deger == null) {
    durum = durumFromTamamlandi(input.tamamlandi);
  } else if (habit) {
    durum = deriveDurum({
      habit,
      deger,
      alt,
      explicit: input.durum,
    });
  } else {
    durum = durumFromTamamlandi(Boolean(input.tamamlandi));
  }

  const tamamlandi =
    durum === "minimum" || durum === "hedef" || durum === "bonus";
  const payload = {
    tamamlandi,
    durum,
    deger,
    notlar:
      input.notlar !== undefined
        ? input.notlar?.trim() || null
        : (existing?.notlar ?? null),
    gun_modu: input.gun_modu ?? existing?.gun_modu ?? null,
    kayit_zamani: new Date().toISOString(),
    alt_adimlar: alt,
    ekstra,
  };

  if (existing) {
    let { data, error } = await supabase
      .from("aliskanlik_kayitlari")
      .update(payload)
      .eq("id", existing.id)
      .select(LOG_SELECT)
      .single();
    if (error && isMissingColumn(error)) {
      ({ data, error } = await supabase
        .from("aliskanlik_kayitlari")
        .update({ tamamlandi })
        .eq("id", existing.id)
        .select(LOG_SELECT_LEGACY)
        .single());
    }
    if (error) return { error: publicDbError(error.message) };
    return mapLog(data as Record<string, unknown>);
  }

  let { data, error } = await supabase
    .from("aliskanlik_kayitlari")
    .insert({
      aliskanlik_id: input.aliskanlik_id,
      tarih: input.tarih,
      ...payload,
    })
    .select(LOG_SELECT)
    .single();
  if (error && isMissingColumn(error)) {
    ({ data, error } = await supabase
      .from("aliskanlik_kayitlari")
      .insert({
        aliskanlik_id: input.aliskanlik_id,
        tarih: input.tarih,
        tamamlandi,
      })
      .select(LOG_SELECT_LEGACY)
      .single());
  }
  if (error) return { error: publicDbError(error.message) };
  return mapLog(data as Record<string, unknown>);
}

/** Eski panel / istatistikler için. */
export async function toggleAliskanlikKayit(input: {
  aliskanlik_id: string;
  tarih: string;
  tamamlandi: boolean;
  durum?: AliskanlikKayitDurum | null;
  deger?: number | null;
  notlar?: string | null;
}): Promise<AliskanlikKayit | { error: string }> {
  return upsertAliskanlikKayit(input);
}

export async function getAliskanlikGunu(
  tarih: string
): Promise<AliskanlikGunu | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("aliskanlik_gunleri")
      .select(
        "id, tarih, gun_modu, notlar, olusturma_tarihi, guncelleme_tarihi"
      )
      .eq("tarih", tarih)
      .maybeSingle();
    if (error || !data) return null;
    return mapGunu(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function upsertAliskanlikGunu(input: {
  tarih: string;
  gun_modu: AliskanlikGunModu;
  notlar?: string | null;
}): Promise<AliskanlikGunu | { error: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("aliskanlik_gunleri")
    .upsert(
      {
        tarih: input.tarih,
        gun_modu: input.gun_modu,
        notlar: input.notlar?.trim() || null,
        guncelleme_tarihi: new Date().toISOString(),
      },
      { onConflict: "tarih" }
    )
    .select(
      "id, tarih, gun_modu, notlar, olusturma_tarihi, guncelleme_tarihi"
    )
    .single();
  if (error) return { error: publicDbError(error.message) };
  return mapGunu(data as Record<string, unknown>);
}

export async function listHaftalikDegerlendirmeler(): Promise<
  AliskanlikHaftalikDegerlendirme[]
> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("aliskanlik_haftalik_degerlendirmeler")
      .select(
        "id, hafta_baslangici, dogal_akan, zorlanan, sorun_turu, buyuk_hedef, kucultme, ust_seviye, notlar, olusturma_tarihi, guncelleme_tarihi"
      )
      .order("hafta_baslangici", { ascending: false })
      .limit(12);
    if (error) return [];
    return (data ?? []).map((r) => mapReview(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function upsertHaftalikDegerlendirme(input: {
  hafta_baslangici: string;
  dogal_akan?: string | null;
  zorlanan?: string | null;
  sorun_turu?: AliskanlikSorunTuru | null;
  buyuk_hedef?: string | null;
  kucultme?: string | null;
  ust_seviye?: string | null;
  notlar?: string | null;
}): Promise<AliskanlikHaftalikDegerlendirme | { error: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("aliskanlik_haftalik_degerlendirmeler")
    .upsert(
      {
        hafta_baslangici: input.hafta_baslangici,
        dogal_akan: input.dogal_akan?.trim() || null,
        zorlanan: input.zorlanan?.trim() || null,
        sorun_turu: input.sorun_turu ?? null,
        buyuk_hedef: input.buyuk_hedef?.trim() || null,
        kucultme: input.kucultme?.trim() || null,
        ust_seviye: input.ust_seviye?.trim() || null,
        notlar: input.notlar?.trim() || null,
        guncelleme_tarihi: new Date().toISOString(),
      },
      { onConflict: "hafta_baslangici" }
    )
    .select(
      "id, hafta_baslangici, dogal_akan, zorlanan, sorun_turu, buyuk_hedef, kucultme, ust_seviye, notlar, olusturma_tarihi, guncelleme_tarihi"
    )
    .single();
  if (error) return { error: publicDbError(error.message) };
  return mapReview(data as Record<string, unknown>);
}

export function planOnizleme(existing: Aliskanlik[], maxAsama: number) {
  return previewHazirPlan(existing, maxAsama);
}

export async function kurHazirPlan(opts: {
  maxAsama: number;
}): Promise<
  | { eklendi: Aliskanlik[]; atlanan: string[] }
  | { error: string }
> {
  const supabase = createAdminClient();
  const probe = await supabase
    .from("aliskanliklar")
    .select("plan_kodu")
    .limit(1);
  if (probe.error && isMissingColumn(probe.error)) {
    return {
      error:
        "Veritabanı güncellemesi gerekli. 090_aliskanliklar_program_alanlari.sql dosyasını uygula.",
    };
  }
  const existing = await listAliskanliklar({
    includeInactive: true,
    includeArchived: true,
  });
  const { eklenecek, atlanan } = previewHazirPlan(existing, opts.maxAsama);
  const created: Aliskanlik[] = [];
  const kodToId = new Map(
    existing
      .filter((h) => h.plan_kodu)
      .map((h) => [h.plan_kodu as string, h.id])
  );

  for (const s of eklenecek) {
    const result = await createAliskanlik({
      ad: s.ad,
      aciklama: s.aciklama,
      kategori: s.kategori,
      kimlik_ifadesi: s.kimlik_ifadesi,
      program_turu: s.program_turu,
      hedef_gunler: s.hedef_gunler,
      hedef_siklik: s.hedef_siklik,
      birim: s.birim,
      minimum_deger: s.minimum_deger,
      hedef_deger: s.hedef_deger,
      tetikleyici: s.tetikleyici,
      zaman_dilimi: s.zaman_dilimi,
      sira: s.sira,
      renk: s.renk,
      ikon: s.ikon,
      ozel_tur: s.ozel_tur,
      alt_adimlar: s.alt_adimlar,
      asama: s.asama,
      plan_kodu: s.plan_kodu,
      aktif: s.asama <= opts.maxAsama,
    });
    if ("error" in result) {
      if (result.error === "Bu kayıt zaten var.") continue;
      return result;
    }
    created.push(result);
    kodToId.set(s.plan_kodu, result.id);
  }

  for (const s of HAZIR_PLAN) {
    if (!s.karsilayan_plan_kodu) continue;
    const id = kodToId.get(s.plan_kodu);
    const other = kodToId.get(s.karsilayan_plan_kodu);
    if (id && other) {
      await updateAliskanlik(id, { karsilayan_aliskanlik_id: other });
    }
  }

  return {
    eklendi: created,
    atlanan: atlanan.map((s) => s.plan_kodu),
  };
}

export async function etkinlestirAsama(
  asama: number
): Promise<Aliskanlik[] | { error: string }> {
  const habits = await listAliskanliklar({
    includeInactive: true,
    includeArchived: true,
  });
  const updated: Aliskanlik[] = [];
  for (const h of habits) {
    if (h.arsivlendi) continue;
    if (h.asama != null && h.asama <= asama && !h.aktif) {
      const r = await setAliskanlikAktif(h.id, true);
      if ("error" in r) return r;
      updated.push(r);
    }
  }
  return updated;
}
