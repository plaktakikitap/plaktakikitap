import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  addDaysISO,
  istanbulHour,
  istanbulTodayISO,
  istanbulWeekdayMon0,
} from "@/lib/date/istanbul";

export type SaatAnalizVeri = Record<string, number>;

export function normalizeSayfaYolu(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let yol = raw.trim();
  if (!yol.startsWith("/")) return null;
  const q = yol.indexOf("?");
  if (q >= 0) yol = yol.slice(0, q);
  const h = yol.indexOf("#");
  if (h >= 0) yol = yol.slice(0, h);
  if (yol.length > 180) yol = yol.slice(0, 180);
  if (yol.startsWith("/secretgate") || yol.startsWith("/api")) return null;
  return yol || "/";
}

export async function recordPageView(yol: string, now = new Date()): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("sayfa_goruntulenmeleri").insert({
    sayfa_yolu: yol,
    saat: istanbulHour(now),
    gun_haftada: istanbulWeekdayMon0(now),
    tarih: istanbulTodayISO(now),
  });
}

export async function getSaatAnaliz(days = 30): Promise<{
  veri: SaatAnalizVeri;
  toplam: number;
  gun: number;
}> {
  const supabase = createAdminClient();
  const since = addDaysISO(istanbulTodayISO(), -(days - 1));
  const { data, error } = await supabase
    .from("sayfa_goruntulenmeleri")
    .select("saat, gun_haftada")
    .gte("tarih", since);

  const veri: SaatAnalizVeri = {};
  if (error || !data) {
    return { veri, toplam: 0, gun: days };
  }

  for (const row of data) {
    const g = Number(row.gun_haftada);
    const s = Number(row.saat);
    if (g < 0 || g > 6 || s < 0 || s > 23) continue;
    const key = `${g}-${s}`;
    veri[key] = (veri[key] ?? 0) + 1;
  }

  const toplam = Object.values(veri).reduce((a, b) => a + b, 0);
  return { veri, toplam, gun: days };
}
