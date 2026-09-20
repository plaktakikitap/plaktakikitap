import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Aliskanlik, AliskanlikKayit } from "@/types/takip";

const HABIT_SELECT = "id, ad, aciklama, aktif, olusturma_tarihi";
const LOG_SELECT = "id, aliskanlik_id, tarih, tamamlandi";

function mapHabit(r: Record<string, unknown>): Aliskanlik {
  return {
    id: r.id as string,
    ad: r.ad as string,
    aciklama: (r.aciklama as string | null) ?? null,
    aktif: Boolean(r.aktif),
    olusturma_tarihi: r.olusturma_tarihi as string,
  };
}

function mapLog(r: Record<string, unknown>): AliskanlikKayit {
  return {
    id: r.id as string,
    aliskanlik_id: r.aliskanlik_id as string,
    tarih: r.tarih as string,
    tamamlandi: Boolean(r.tamamlandi),
  };
}

export async function listAliskanliklar(opts?: {
  includeInactive?: boolean;
}): Promise<Aliskanlik[]> {
  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("aliskanliklar")
      .select(HABIT_SELECT)
      .order("olusturma_tarihi", { ascending: true });
    if (!opts?.includeInactive) q = q.eq("aktif", true);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []).map((r) => mapHabit(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function createAliskanlik(input: {
  ad: string;
  aciklama?: string | null;
}): Promise<Aliskanlik | { error: string }> {
  const ad = input.ad.trim();
  if (!ad) return { error: "Alışkanlık adı gerekli." };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("aliskanliklar")
    .insert({
      ad,
      aciklama: input.aciklama?.trim() || null,
      aktif: true,
    })
    .select(HABIT_SELECT)
    .single();
  if (error) return { error: error.message };
  return mapHabit(data as Record<string, unknown>);
}

export async function setAliskanlikAktif(
  id: string,
  aktif: boolean
): Promise<Aliskanlik | { error: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("aliskanliklar")
    .update({ aktif })
    .eq("id", id)
    .select(HABIT_SELECT)
    .single();
  if (error) return { error: error.message };
  return mapHabit(data as Record<string, unknown>);
}

export async function listAliskanlikKayitlari(opts?: {
  from?: string;
  to?: string;
}): Promise<AliskanlikKayit[]> {
  try {
    const supabase = createAdminClient();
    let q = supabase.from("aliskanlik_kayitlari").select(LOG_SELECT);
    if (opts?.from) q = q.gte("tarih", opts.from);
    if (opts?.to) q = q.lte("tarih", opts.to);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []).map((r) => mapLog(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function toggleAliskanlikKayit(input: {
  aliskanlik_id: string;
  tarih: string;
  tamamlandi: boolean;
}): Promise<AliskanlikKayit | { error: string }> {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("aliskanlik_kayitlari")
    .select(LOG_SELECT)
    .eq("aliskanlik_id", input.aliskanlik_id)
    .eq("tarih", input.tarih)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("aliskanlik_kayitlari")
      .update({ tamamlandi: input.tamamlandi })
      .eq("id", existing.id)
      .select(LOG_SELECT)
      .single();
    if (error) return { error: error.message };
    return mapLog(data as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from("aliskanlik_kayitlari")
    .insert({
      aliskanlik_id: input.aliskanlik_id,
      tarih: input.tarih,
      tamamlandi: input.tamamlandi,
    })
    .select(LOG_SELECT)
    .single();
  if (error) return { error: error.message };
  return mapLog(data as Record<string, unknown>);
}

/** Bugünden geriye ardışık tamamlanmış gün sayısı */
export function calcStreak(
  logs: AliskanlikKayit[],
  habitId: string,
  todayISO: string
): number {
  const done = new Set(
    logs
      .filter((l) => l.aliskanlik_id === habitId && l.tamamlandi)
      .map((l) => l.tarih)
  );
  let streak = 0;
  const d = new Date(todayISO + "T12:00:00");
  // If today not done, start from yesterday
  if (!done.has(todayISO)) {
    d.setDate(d.getDate() - 1);
  }
  for (;;) {
    const iso = d.toISOString().slice(0, 10);
    if (!done.has(iso)) break;
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
