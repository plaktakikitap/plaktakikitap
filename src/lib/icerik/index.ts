import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  IcDurum,
  IcHesap,
  IcHatirlaticiPending,
  IcIcerik,
  IcIcerikWithHesap,
  IcPlatform,
  IcTur,
} from "@/types/icerik";

function normalizePlatforms(raw: unknown): IcPlatform[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (p): p is IcPlatform =>
      p === "instagram" || p === "tiktok" || p === "youtube"
  );
}

function mapHesap(row: Record<string, unknown>): IcHesap {
  return {
    id: String(row.id),
    ad: String(row.ad ?? ""),
    renk: String(row.renk ?? "#c9a65a"),
    platformlar: normalizePlatforms(row.platformlar),
    aktif: row.aktif !== false,
    sira: Number(row.sira ?? 0),
    hedef_iki_gunde_bir: row.hedef_iki_gunde_bir !== false,
  };
}

function mapIcerik(row: Record<string, unknown>): IcIcerik {
  return {
    id: String(row.id),
    hesap_id: String(row.hesap_id),
    tur: row.tur as IcTur,
    platform: row.platform as IcPlatform,
    baslik: String(row.baslik ?? ""),
    aciklama: (row.aciklama as string | null) ?? null,
    durum: (row.durum as IcDurum) ?? "fikir",
    planlanan_tarih: (row.planlanan_tarih as string | null) ?? null,
    paylasim_tarihi: (row.paylasim_tarihi as string | null) ?? null,
    notlar: (row.notlar as string | null) ?? null,
    olusturma_tarihi: String(row.olusturma_tarihi ?? ""),
    guncelleme_tarihi: String(row.guncelleme_tarihi ?? ""),
  };
}

export async function listIcHesaplar(opts?: {
  includeInactive?: boolean;
}): Promise<IcHesap[]> {
  const supabase = createAdminClient();
  let q = supabase.from("ic_hesaplar").select("*").order("sira", { ascending: true });
  if (!opts?.includeInactive) q = q.eq("aktif", true);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []).map((r) => mapHesap(r as Record<string, unknown>));
}

export async function createIcHesap(input: {
  ad: string;
  renk: string;
  platformlar: IcPlatform[];
  sira?: number;
}): Promise<IcHesap | { error: string }> {
  const supabase = createAdminClient();
  const ad = input.ad.trim();
  if (!ad) return { error: "Hesap adı gerekli." };
  if (!input.platformlar.length) return { error: "En az bir platform seçin." };
  const { data, error } = await supabase
    .from("ic_hesaplar")
    .insert({
      ad,
      renk: input.renk || "#c9a65a",
      platformlar: input.platformlar,
      sira: input.sira ?? 99,
      aktif: true,
      hedef_iki_gunde_bir: true,
    })
    .select("*")
    .single();
  if (error) return { error: error.message };
  return mapHesap(data as Record<string, unknown>);
}

export async function updateIcHesap(
  id: string,
  input: Partial<{
    ad: string;
    renk: string;
    platformlar: IcPlatform[];
    aktif: boolean;
    sira: number;
    hedef_iki_gunde_bir: boolean;
  }>
): Promise<IcHesap | { error: string }> {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (input.ad !== undefined) updates.ad = input.ad.trim();
  if (input.renk !== undefined) updates.renk = input.renk;
  if (input.platformlar !== undefined) updates.platformlar = input.platformlar;
  if (input.aktif !== undefined) updates.aktif = input.aktif;
  if (input.sira !== undefined) updates.sira = input.sira;
  if (input.hedef_iki_gunde_bir !== undefined)
    updates.hedef_iki_gunde_bir = input.hedef_iki_gunde_bir;
  const { data, error } = await supabase
    .from("ic_hesaplar")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { error: error.message };
  return mapHesap(data as Record<string, unknown>);
}

export async function listIcIcerikler(opts?: {
  hesapId?: string;
}): Promise<IcIcerikWithHesap[]> {
  const supabase = createAdminClient();
  let q = supabase
    .from("ic_icerikler")
    .select("*, ic_hesaplar(id, ad, renk)")
    .order("guncelleme_tarihi", { ascending: false });
  if (opts?.hesapId) q = q.eq("hesap_id", opts.hesapId);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const hesapRaw = r.ic_hesaplar as Record<string, unknown> | null;
    const base = mapIcerik(r);
    return {
      ...base,
      hesap: hesapRaw
        ? {
            id: String(hesapRaw.id),
            ad: String(hesapRaw.ad),
            renk: String(hesapRaw.renk),
          }
        : null,
    };
  });
}

export async function createIcIcerik(input: {
  hesap_id: string;
  tur: IcTur;
  platforms: IcPlatform[];
  baslik: string;
  aciklama?: string | null;
  durum?: IcDurum;
  planlanan_tarih?: string | null;
  notlar?: string | null;
  hatirlatma_zamani?: string | null;
}): Promise<IcIcerik[] | { error: string }> {
  const supabase = createAdminClient();
  const baslik = input.baslik.trim();
  if (!baslik) return { error: "Başlık gerekli." };
  if (!input.hesap_id) return { error: "Hesap seçin." };
  if (!input.platforms.length) return { error: "Platform seçin." };

  const rows = input.platforms.map((platform) => ({
    hesap_id: input.hesap_id,
    tur: input.tur,
    platform,
    baslik,
    aciklama: input.aciklama?.trim() || null,
    durum: input.durum ?? "fikir",
    planlanan_tarih: input.planlanan_tarih || null,
    notlar: input.notlar?.trim() || null,
  }));

  const { data, error } = await supabase
    .from("ic_icerikler")
    .insert(rows)
    .select("*");
  if (error) return { error: error.message };

  const created = (data ?? []).map((r) => mapIcerik(r as Record<string, unknown>));

  if (input.hatirlatma_zamani && created.length) {
    await supabase.from("ic_hatirlaticilar").insert(
      created.map((c) => ({
        icerik_id: c.id,
        hatirlatma_zamani: input.hatirlatma_zamani,
        gonderildi: false,
      }))
    );
  }

  return created;
}

export async function updateIcIcerik(
  id: string,
  input: Partial<{
    hesap_id: string;
    tur: IcTur;
    platform: IcPlatform;
    baslik: string;
    aciklama: string | null;
    durum: IcDurum;
    planlanan_tarih: string | null;
    paylasim_tarihi: string | null;
    notlar: string | null;
  }>
): Promise<IcIcerik | { error: string }> {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (input.hesap_id !== undefined) updates.hesap_id = input.hesap_id;
  if (input.tur !== undefined) updates.tur = input.tur;
  if (input.platform !== undefined) updates.platform = input.platform;
  if (input.baslik !== undefined) updates.baslik = input.baslik.trim();
  if (input.aciklama !== undefined) updates.aciklama = input.aciklama;
  if (input.durum !== undefined) {
    updates.durum = input.durum;
    if (input.durum === "paylasildi" && input.paylasim_tarihi === undefined) {
      updates.paylasim_tarihi = new Date().toISOString().slice(0, 10);
    }
  }
  if (input.planlanan_tarih !== undefined)
    updates.planlanan_tarih = input.planlanan_tarih;
  if (input.paylasim_tarihi !== undefined)
    updates.paylasim_tarihi = input.paylasim_tarihi;
  if (input.notlar !== undefined) updates.notlar = input.notlar;

  const { data, error } = await supabase
    .from("ic_icerikler")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { error: error.message };
  return mapIcerik(data as Record<string, unknown>);
}

export async function advanceIcIcerikDurum(
  id: string
): Promise<IcIcerik | { error: string }> {
  const supabase = createAdminClient();
  const { data: row, error: fetchErr } = await supabase
    .from("ic_icerikler")
    .select("durum")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr || !row) return { error: "İçerik bulunamadı." };
  const order: IcDurum[] = ["fikir", "yazildi", "hazir", "paylasildi"];
  const idx = order.indexOf(row.durum as IcDurum);
  if (idx < 0 || idx >= order.length - 1) {
    return { error: "Daha ileri durum yok." };
  }
  const next = order[idx + 1]!;
  return updateIcIcerik(id, { durum: next });
}

export async function deleteIcIcerik(
  id: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("ic_icerikler").delete().eq("id", id);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function checkAndClaimHatirlaticilar(): Promise<
  IcHatirlaticiPending[]
> {
  const supabase = createAdminClient();
  const until = new Date(Date.now() + 5 * 60_000).toISOString();
  const { data, error } = await supabase
    .from("ic_hatirlaticilar")
    .select("id, hatirlatma_zamani, icerik_id, ic_icerikler(baslik, ic_hesaplar(ad))")
    .eq("gonderildi", false)
    .lte("hatirlatma_zamani", until);

  if (error || !data?.length) return [];

  const ids = data.map((h) => h.id as string);
  await supabase
    .from("ic_hatirlaticilar")
    .update({ gonderildi: true })
    .in("id", ids);

  return data.map((h) => {
    const icerik = h.ic_icerikler as unknown as {
      baslik?: string;
      ic_hesaplar?: { ad?: string } | null;
    } | null;
    return {
      id: h.id as string,
      hatirlatma_zamani: h.hatirlatma_zamani as string,
      icerik_baslik: icerik?.baslik ?? "İçerik",
      hesap_ad: icerik?.ic_hesaplar?.ad ?? "",
    };
  });
}

export async function getIcDashboardStats() {
  const supabase = createAdminClient();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

  const { data: all } = await supabase
    .from("ic_icerikler")
    .select("*, ic_hesaplar(ad, renk)")
    .order("planlanan_tarih", { ascending: true });

  const items = (all ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const hesap = row.ic_hesaplar as { ad?: string; renk?: string } | null;
    return {
      ...mapIcerik(row),
      hesap_ad: hesap?.ad ?? "",
      hesap_renk: hesap?.renk ?? "#c9a65a",
    };
  });

  const weekPlanned = items.filter(
    (i) =>
      i.planlanan_tarih &&
      i.planlanan_tarih >= weekStartStr &&
      i.planlanan_tarih <= todayStr
  ).length;
  const weekShared = items.filter(
    (i) =>
      i.durum === "paylasildi" &&
      i.paylasim_tarihi &&
      i.paylasim_tarihi >= weekStartStr &&
      i.paylasim_tarihi <= todayStr
  ).length;

  const todayPlanned = items.filter((i) => i.planlanan_tarih === todayStr);

  const overdue = items.filter(
    (i) =>
      i.planlanan_tarih &&
      i.planlanan_tarih < todayStr &&
      (i.durum === "fikir" || i.durum === "yazildi" || i.durum === "hazir")
  );

  const monthPlanned = items.filter(
    (i) => i.planlanan_tarih && i.planlanan_tarih >= monthStart
  ).length;
  const monthShared = items.filter(
    (i) =>
      i.durum === "paylasildi" &&
      i.paylasim_tarihi &&
      i.paylasim_tarihi >= monthStart
  ).length;

  const next7 = new Date(today);
  next7.setDate(today.getDate() + 7);
  const next7Str = next7.toISOString().slice(0, 10);
  const upcoming = items.filter(
    (i) =>
      i.planlanan_tarih &&
      i.planlanan_tarih >= todayStr &&
      i.planlanan_tarih <= next7Str &&
      i.durum !== "paylasildi"
  );

  return {
    weekPlanned,
    weekShared,
    todayPlanned,
    overdue,
    monthPlanned,
    monthShared,
    upcoming,
  };
}
