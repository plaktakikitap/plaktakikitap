import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { VucutOlcum, VucutOlcumAlani } from "@/types/takip";
import { OLCUM_ALANLARI } from "@/lib/takip/vucut-analiz";

const SELECT =
  "id, tarih, kilo_kg, boy_cm, yag_yuzde, kas_yuzde, su_yuzde, protein_yuzde, iskelet_kas_yuzde, kemik_kg, visseral_yag, bmr_kcal, metabolik_yas, bel_cm, kalca_cm, gogus_cm, boyun_cm, notlar, olusturma_tarihi";

const ALANLAR: VucutOlcumAlani[] = [
  "kilo_kg",
  "boy_cm",
  "yag_yuzde",
  "kas_yuzde",
  "su_yuzde",
  "protein_yuzde",
  "iskelet_kas_yuzde",
  "kemik_kg",
  "visseral_yag",
  "bmr_kcal",
  "metabolik_yas",
  "bel_cm",
  "kalca_cm",
  "gogus_cm",
  "boyun_cm",
];

const ARALIK: Record<VucutOlcumAlani, [number, number]> = {
  kilo_kg: [25, 350],
  boy_cm: [80, 250],
  yag_yuzde: [1, 70],
  kas_yuzde: [5, 80],
  su_yuzde: [20, 80],
  protein_yuzde: [1, 40],
  iskelet_kas_yuzde: [5, 80],
  kemik_kg: [0.5, 20],
  visseral_yag: [1, 59],
  bmr_kcal: [600, 5000],
  metabolik_yas: [10, 120],
  bel_cm: [40, 200],
  kalca_cm: [40, 200],
  gogus_cm: [40, 200],
  boyun_cm: [20, 80],
};

const TAM_SAYI = new Set<VucutOlcumAlani>([
  "visseral_yag",
  "bmr_kcal",
  "metabolik_yas",
]);

function writeError(message: string) {
  if (/row-level security/i.test(message)) {
    return "Kayıt yazılamadı. Sunucuda SUPABASE_SERVICE_ROLE_KEY yok; ölçümler bu anahtar olmadan veritabanına gitmiyor.";
  }
  return message;
}

function num(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n =
    typeof value === "number"
      ? value
      : Number(String(value).trim().replace(",", "."));
  return Number.isFinite(n) ? n : Number.NaN;
}

function map(row: Record<string, unknown>): VucutOlcum {
  const out = {
    id: row.id as string,
    tarih: String(row.tarih).slice(0, 10),
    notlar: (row.notlar as string | null) ?? null,
    olusturma_tarihi: row.olusturma_tarihi as string,
  } as VucutOlcum;
  for (const key of ALANLAR) {
    const raw = row[key];
    out[key] = raw == null || raw === "" ? null : Number(raw);
  }
  return out;
}

export async function listVucutOlcumleri(): Promise<VucutOlcum[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("vucut_olcumleri")
      .select(SELECT)
      .order("tarih", { ascending: false })
      .limit(500);
    if (error) return [];
    return (data ?? []).map((row) => map(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

export function parseVucutOlcum(input: {
  tarih?: unknown;
  notlar?: unknown;
  degerler?: Partial<Record<VucutOlcumAlani, unknown>>;
}): { tarih: string; notlar: string | null; degerler: Partial<Record<VucutOlcumAlani, number | null>> } | { error: string } {
  const tarih = typeof input.tarih === "string" ? input.tarih.slice(0, 10) : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tarih)) return { error: "Tarih gerekli." };

  const degerler: Partial<Record<VucutOlcumAlani, number | null>> = {};
  let dolu = false;
  for (const key of ALANLAR) {
    const raw = num(input.degerler?.[key]);
    if (raw == null) {
      degerler[key] = null;
      continue;
    }
    if (Number.isNaN(raw)) return { error: "Sayılar rakam olmalı." };
    const [min, max] = ARALIK[key];
    if (raw < min || raw > max) {
      const label = OLCUM_ALANLARI.find((item) => item.key === key)?.label ?? key;
      return { error: `${label} ${min}–${max} aralığında olmalı.` };
    }
    degerler[key] = TAM_SAYI.has(key) ? Math.round(raw) : Math.round(raw * 10) / 10;
    dolu = true;
  }
  if (!dolu) return { error: "En az bir ölçü gir." };

  const notlar =
    typeof input.notlar === "string" && input.notlar.trim()
      ? input.notlar.trim().slice(0, 500)
      : null;
  return { tarih, notlar, degerler };
}

export async function upsertVucutOlcum(input: {
  tarih: string;
  notlar: string | null;
  degerler: Partial<Record<VucutOlcumAlani, number | null>>;
}): Promise<VucutOlcum | { error: string }> {
  const supabase = createAdminClient();
  const payload: Record<string, unknown> = {
    tarih: input.tarih,
    notlar: input.notlar,
  };
  for (const key of ALANLAR) payload[key] = input.degerler[key] ?? null;

  if (payload.boy_cm == null) {
    const { data: onceki } = await supabase
      .from("vucut_olcumleri")
      .select("boy_cm")
      .not("boy_cm", "is", null)
      .order("tarih", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (onceki?.boy_cm != null) payload.boy_cm = onceki.boy_cm;
  }

  const { data, error } = await supabase
    .from("vucut_olcumleri")
    .upsert(payload, { onConflict: "tarih" })
    .select(SELECT)
    .single();
  if (error) return { error: writeError(error.message) };
  if (!data) return { error: "Kayıt yazılamadı." };
  return map(data as Record<string, unknown>);
}

export async function deleteVucutOlcum(id: string): Promise<{ error?: string }> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Geçersiz kayıt." };
  const supabase = createAdminClient();
  const { error } = await supabase.from("vucut_olcumleri").delete().eq("id", id);
  if (error) return { error: writeError(error.message) };
  return {};
}
