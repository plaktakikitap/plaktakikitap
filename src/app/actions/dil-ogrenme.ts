"use server";

import { revalidatePath } from "next/cache";
import { isAdminApiAuthorized } from "@/lib/admin/requireAdminApi";
import { addDaysISO, istanbulTodayISO } from "@/lib/date/istanbul";
import { createAdminClient } from "@/lib/supabase/admin";
import { degerlendirYazi } from "@/lib/takip/dil-yazi-degerlendirme";
import type {
  Dil,
  DilIlerleme,
  DilKelime,
  KelimeTipi,
  OgrenmeDurumu,
  OgrenmeKaydi,
  QuizSorusu,
  Seviye,
  SeviyeIlerleme,
} from "@/types/dil-ogrenme";
import { isDil, SEVIYELER } from "@/types/dil-ogrenme";

const TIPS: KelimeTipi[] = ["kelime", "phrasal", "kalip", "kolokasyon"];
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const sb = () => createAdminClient();

async function requireWrite() {
  if (!(await isAdminApiAuthorized())) {
    throw new Error("Yetkisiz erişim");
  }
}

function revalidateDil(dil?: Dil) {
  revalidatePath("/secretgate/diller");
  if (dil) {
    revalidatePath(`/secretgate/diller/${dil}`);
    revalidatePath(`/secretgate/diller/${dil}/ogrenme`);
  }
}

function assertDil(v: string): Dil {
  if (!isDil(v)) throw new Error("Geçersiz dil.");
  return v;
}

function assertSeviye(v: string): Seviye {
  if (!SEVIYELER.includes(v as Seviye)) throw new Error("Geçersiz seviye.");
  return v as Seviye;
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function consecutiveStreak(dates: Set<string>, today: string): number {
  let cursor = today;
  if (!dates.has(cursor)) cursor = addDaysISO(cursor, -1);
  let n = 0;
  while (dates.has(cursor)) {
    n += 1;
    cursor = addDaysISO(cursor, -1);
  }
  return n;
}

function mapKayit(raw: unknown): OgrenmeKaydi | undefined {
  if (!raw) return undefined;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row || typeof row !== "object") return undefined;
  const r = row as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.kelime_id !== "string") return undefined;
  return {
    id: r.id,
    kelime_id: r.kelime_id,
    durum: r.durum as OgrenmeDurumu,
    dogru_sayisi: Number(r.dogru_sayisi) || 0,
    yanlis_sayisi: Number(r.yanlis_sayisi) || 0,
    son_gorulme: typeof r.son_gorulme === "string" ? r.son_gorulme : undefined,
    sonraki_tekrar: String(r.sonraki_tekrar ?? ""),
  };
}

function mapKelime(row: Record<string, unknown>): DilKelime {
  return {
    id: String(row.id),
    dil: row.dil as Dil,
    seviye: row.seviye as Seviye,
    tip: row.tip as KelimeTipi,
    hedef_dil: String(row.hedef_dil ?? ""),
    anlam_tr: String(row.anlam_tr ?? ""),
    ornek_cumle:
      typeof row.ornek_cumle === "string" ? row.ornek_cumle : undefined,
    ornek_cumle_tr:
      typeof row.ornek_cumle_tr === "string" ? row.ornek_cumle_tr : undefined,
    notlar: typeof row.notlar === "string" ? row.notlar : undefined,
    created_at: String(row.created_at ?? ""),
  };
}

// ─── Kelime CRUD ───────────────────────────────────────────────────────────

export async function kelimeEkle(data: {
  dil: Dil;
  seviye: Seviye;
  tip: KelimeTipi;
  hedef_dil: string;
  anlam_tr: string;
  ornek_cumle?: string;
  ornek_cumle_tr?: string;
  notlar?: string;
}) {
  await requireWrite();
  const dil = assertDil(data.dil);
  const seviye = assertSeviye(data.seviye);
  if (!TIPS.includes(data.tip)) throw new Error("Geçersiz tip.");
  const hedef_dil = data.hedef_dil.trim();
  const anlam_tr = data.anlam_tr.trim();
  if (!hedef_dil || !anlam_tr) throw new Error("Kelime ve anlam gerekli.");

  const { error } = await sb().from("dil_kelime_hazinesi").insert({
    dil,
    seviye,
    tip: data.tip,
    hedef_dil,
    anlam_tr,
    ornek_cumle: data.ornek_cumle?.trim() || null,
    ornek_cumle_tr: data.ornek_cumle_tr?.trim() || null,
    notlar: data.notlar?.trim() || null,
  });
  if (error) throw new Error(error.message);
  revalidateDil(dil);
}

export async function kelimeSil(id: string) {
  await requireWrite();
  if (!UUID_RE.test(id)) throw new Error("Geçersiz id.");
  const { error } = await sb().from("dil_kelime_hazinesi").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateDil();
}

export async function kelimeGuncelle(id: string, data: Partial<DilKelime>) {
  await requireWrite();
  if (!UUID_RE.test(id)) throw new Error("Geçersiz id.");
  const {
    id: _id,
    created_at: _created,
    ...rest
  } = data;
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue;
    patch[key] = typeof value === "string" ? value.trim() || null : value;
  }
  if (Object.keys(patch).length === 0) return;
  const { error } = await sb()
    .from("dil_kelime_hazinesi")
    .update(patch)
    .eq("id", id);
  if (error) throw new Error(error.message);
  if (typeof patch.dil === "string" && isDil(patch.dil)) revalidateDil(patch.dil);
  else revalidateDil();
}

// ─── Öğrenme kaydı ─────────────────────────────────────────────────────────

const SR_ARALIK: Record<OgrenmeDurumu, number> = {
  yeni: 0,
  ogreniyor: 1,
  tekrar: 3,
  ustalasildi: 7,
};

function sonrakiTekrarHesapla(durum: OgrenmeDurumu): string {
  return `${addDaysISO(istanbulTodayISO(), SR_ARALIK[durum])}T12:00:00+03:00`;
}

function tarihGun(v: unknown): string {
  return typeof v === "string" ? v.slice(0, 10) : "";
}

function cevapSonucu(
  dogru: boolean,
  oncekiDurum: OgrenmeDurumu | null,
  oncekiDogru: number
): {
  yeniDurum: OgrenmeDurumu;
  xp: number;
  etkinlik: "dogru_cevap" | "yanlislik" | "ustalasildi";
  dogru_sayisi: number;
} {
  if (!dogru) {
    return {
      yeniDurum: "ogreniyor",
      xp: 2,
      etkinlik: "yanlislik",
      dogru_sayisi: 1,
    };
  }

  const dogru_sayisi = oncekiDogru + 1;
  const yeniDurum: OgrenmeDurumu =
    dogru_sayisi >= 5 ? "ustalasildi" : dogru_sayisi >= 3 ? "tekrar" : "ogreniyor";

  if (yeniDurum === "ustalasildi" && oncekiDurum !== "ustalasildi") {
    return { yeniDurum, xp: 25, etkinlik: "ustalasildi", dogru_sayisi };
  }
  if (
    yeniDurum === "tekrar" &&
    oncekiDurum !== "tekrar" &&
    oncekiDurum !== "ustalasildi"
  ) {
    return { yeniDurum, xp: 15, etkinlik: "dogru_cevap", dogru_sayisi };
  }
  return { yeniDurum, xp: 10, etkinlik: "dogru_cevap", dogru_sayisi };
}

export async function cevapKaydet(kelimeId: string, dogru: boolean, dil: Dil) {
  await requireWrite();
  if (!UUID_RE.test(kelimeId)) throw new Error("Geçersiz kelime.");
  const dilKod = assertDil(dil);
  const client = sb();

  const { data: mevcut } = await client
    .from("dil_ogrenme_kayitlari")
    .select("*")
    .eq("kelime_id", kelimeId)
    .maybeSingle();

  const oncekiDurum = (mevcut?.durum as OgrenmeDurumu | undefined) ?? null;
  const { yeniDurum, xp, etkinlik, dogru_sayisi } = cevapSonucu(
    dogru,
    oncekiDurum,
    Number(mevcut?.dogru_sayisi) || 0
  );

  const kayitData = {
    kelime_id: kelimeId,
    durum: yeniDurum,
    dogru_sayisi,
    yanlis_sayisi: dogru
      ? Number(mevcut?.yanlis_sayisi) || 0
      : (Number(mevcut?.yanlis_sayisi) || 0) + 1,
    son_gorulme: new Date().toISOString(),
    sonraki_tekrar: sonrakiTekrarHesapla(yeniDurum),
  };

  if (mevcut) {
    const { error } = await client
      .from("dil_ogrenme_kayitlari")
      .update(kayitData)
      .eq("id", mevcut.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await client.from("dil_ogrenme_kayitlari").insert(kayitData);
    if (error) throw new Error(error.message);
  }

  const { error: xpError } = await client.from("dil_xp_kayitlari").insert({
    dil: dilKod,
    etkinlik,
    xp,
    tarih: istanbulTodayISO(),
  });
  if (xpError) throw new Error(xpError.message);

  revalidateDil(dilKod);
  return { yeniDurum, xp };
}

// ─── İlerleme ──────────────────────────────────────────────────────────────

export async function dilIlerlemeGetir(dil: Dil): Promise<DilIlerleme> {
  await requireWrite();
  const dilKod = assertDil(dil);
  const client = sb();
  const bugun = istanbulTodayISO();

  const { data: kelimeler } = await client
    .from("dil_kelime_hazinesi")
    .select("id, seviye")
    .eq("dil", dilKod);

  const ids = (kelimeler ?? []).map((k) => k.id as string);
  const { data: kayitlar } =
    ids.length === 0
      ? { data: [] as { kelime_id: string; durum: string }[] }
      : await client
          .from("dil_ogrenme_kayitlari")
          .select("kelime_id, durum")
          .in("kelime_id", ids);

  const kayitMap = new Map(
    (kayitlar ?? []).map((k) => [k.kelime_id as string, k.durum as OgrenmeDurumu])
  );

  const { data: xpKayitlari } = await client
    .from("dil_xp_kayitlari")
    .select("xp, tarih")
    .eq("dil", dilKod);

  const toplamXp =
    xpKayitlari?.reduce((sum, k) => sum + (Number(k.xp) || 0), 0) ?? 0;
  const bugunXp =
    xpKayitlari
      ?.filter((k) => tarihGun(k.tarih) === bugun)
      .reduce((sum, k) => sum + (Number(k.xp) || 0), 0) ?? 0;

  const gunler = new Set(
    (xpKayitlari ?? []).map((k) => tarihGun(k.tarih)).filter(Boolean)
  );
  const streak = consecutiveStreak(gunler, bugun);

  let oncekiSeviyeAcildi = true;
  const seviyeler: SeviyeIlerleme[] = SEVIYELER.map((seviye, idx) => {
    const seviyeKelimeler =
      kelimeler?.filter((k) => k.seviye === seviye) ?? [];
    const toplam = seviyeKelimeler.length;
    const sayimlar = { yeni: 0, ogreniyor: 0, tekrar: 0, ustalasildi: 0 };

    for (const k of seviyeKelimeler) {
      const durum = kayitMap.get(k.id as string) ?? "yeni";
      sayimlar[durum] += 1;
    }

    const yuzde =
      toplam > 0 ? Math.round((sayimlar.ustalasildi / toplam) * 100) : 0;
    const acildi = idx === 0 ? true : oncekiSeviyeAcildi;
    oncekiSeviyeAcildi = yuzde >= 80;

    return { seviye, toplam, ...sayimlar, yuzde, acildi };
  });

  return {
    dil: dilKod,
    toplam_xp: toplamXp,
    bugun_xp: bugunXp,
    streak,
    seviyeler,
  };
}

// ─── Quiz ──────────────────────────────────────────────────────────────────

export async function quizSorularUret(
  dil: Dil,
  seviye: Seviye,
  adet = 10
): Promise<QuizSorusu[]> {
  await requireWrite();
  const dilKod = assertDil(dil);
  const seviyeKod = assertSeviye(seviye);
  const simdiMs = Date.now();

  const { data: kelimeler, error } = await sb()
    .from("dil_kelime_hazinesi")
    .select("*, dil_ogrenme_kayitlari(*)")
    .eq("dil", dilKod)
    .eq("seviye", seviyeKod);
  if (error) throw new Error(error.message);
  if (!kelimeler || kelimeler.length === 0) return [];

  const sirali = kelimeler
    .map((k) => {
      const kayit = mapKayit(
        (k as { dil_ogrenme_kayitlari?: unknown }).dil_ogrenme_kayitlari
      );
      const yeni = !kayit || kayit.durum === "yeni";
      const vadesiGeldi = kayit?.sonraki_tekrar
        ? new Date(kayit.sonraki_tekrar).getTime() <= simdiMs
        : true;
      return {
        row: k as Record<string, unknown>,
        kayit,
        oncelik: yeni ? 0 : 1,
        dahil: yeni || vadesiGeldi,
      };
    })
    .filter((k) => k.dahil)
    .sort((a, b) => a.oncelik - b.oncelik);

  const karisik = shuffle(sirali).slice(0, adet);
  const mapped = kelimeler.map((k) => mapKelime(k as Record<string, unknown>));
  const tumAnlamlar = mapped.map((k) => k.anlam_tr);
  const tumHedefler = mapped.map((k) => k.hedef_dil);

  return karisik.map(({ row, kayit }) => {
    const kelime = mapKelime(row);
    const yon = Math.random() > 0.5 ? "tr_to_target" : "target_to_tr";
    const dogru = yon === "tr_to_target" ? kelime.hedef_dil : kelime.anlam_tr;
    const havuz = yon === "tr_to_target" ? tumHedefler : tumAnlamlar;
    const yanlis = shuffle(havuz.filter((a) => a !== dogru)).slice(0, 3);
    const secenekler = shuffle([...yanlis, dogru]);
    return { kelime, kayit, yon, secenekler, dogru_cevap: dogru };
  });
}

// ─── Yazı ödevi ────────────────────────────────────────────────────────────

export async function bugunkunOdevGetir(dil: Dil, seviye: Seviye) {
  await requireWrite();
  const dilKod = assertDil(dil);
  const seviyeKod = assertSeviye(seviye);
  const { data } = await sb()
    .from("dil_yazi_odevleri")
    .select("*")
    .eq("dil", dilKod)
    .eq("seviye", seviyeKod)
    .eq("tarih", istanbulTodayISO())
    .maybeSingle();
  return data;
}

export async function odevEkle(data: {
  dil: Dil;
  seviye: Seviye;
  prompt_tr: string;
}) {
  await requireWrite();
  const dil = assertDil(data.dil);
  const seviye = assertSeviye(data.seviye);
  const prompt_tr = data.prompt_tr.trim();
  if (!prompt_tr) throw new Error("Görev açıklaması gerekli.");

  const { error } = await sb()
    .from("dil_yazi_odevleri")
    .upsert(
      {
        dil,
        seviye,
        prompt_tr,
        tarih: istanbulTodayISO(),
      },
      { onConflict: "dil,seviye,tarih" }
    );
  if (error) throw new Error(error.message);
  revalidateDil(dil);
}

export async function yaziGonder(data: {
  odev_id: string;
  dil: Dil;
  metin: string;
}) {
  await requireWrite();
  const dil = assertDil(data.dil);
  const metin = data.metin.trim();
  if (!metin) throw new Error("Metin boş olamaz.");
  if (!UUID_RE.test(data.odev_id)) throw new Error("Geçersiz ödev.");

  let ai_geri_bildirim: string | null = null;
  let puan: number | null = null;
  try {
    const sonuc = await degerlendirYazi(metin, dil);
    if (sonuc.ok) {
      ai_geri_bildirim = JSON.stringify(sonuc.data);
      puan = sonuc.data.puan;
    } else if (sonuc.puan != null) {
      ai_geri_bildirim = JSON.stringify({
        puan: sonuc.puan,
        oneri: sonuc.oneri,
        hata: sonuc.hata,
      });
      puan = sonuc.puan;
    }
  } catch (err) {
    console.error("yaziGonder degerlendirme:", err);
  }

  const client = sb();
  const { error } = await client.from("dil_yazi_gonderimleri").insert({
    odev_id: data.odev_id,
    dil,
    metin,
    ai_geri_bildirim,
    puan,
  });
  if (error) throw new Error(error.message);

  const { error: xpError } = await client.from("dil_xp_kayitlari").insert({
    dil,
    etkinlik: "yazi",
    xp: 50,
    tarih: istanbulTodayISO(),
  });
  if (xpError) throw new Error(xpError.message);

  revalidateDil(dil);
  return { puan, ai_geri_bildirim };
}