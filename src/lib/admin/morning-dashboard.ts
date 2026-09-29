import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  addDaysISO,
  formatIstanbulLong,
  istanbulHour,
  istanbulTodayISO,
  startOfMonthISO,
} from "@/lib/date/istanbul";
import { getIcDashboardStats } from "@/lib/icerik";
import { calcStreak, listAliskanlikKayitlari, listAliskanliklar } from "@/lib/takip/aliskanliklar";
import type {
  DashboardIcerik,
  DashboardKitap,
  DashboardNot,
  DashboardTodo,
  DashboardYazi,
  MorningDashboard,
} from "@/types/admin-dashboard";

function isoFromTimestamp(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length < 10) return null;
  return raw.slice(0, 10);
}

function consecutiveDayStreak(dates: Set<string>, today: string): number {
  let cursor = today;
  if (!dates.has(cursor)) cursor = addDaysISO(cursor, -1);
  let n = 0;
  while (dates.has(cursor)) {
    n += 1;
    cursor = addDaysISO(cursor, -1);
  }
  return n;
}

export async function getMorningDashboard(): Promise<MorningDashboard> {
  const sb = createAdminClient();
  const bugun = istanbulTodayISO();
  const ayBasi = startOfMonthISO(bugun);
  const streakFrom = addDaysISO(bugun, -90);

  const [
    acilRes,
    gunlukRes,
    featuredRes,
    readingRes,
    sporRes,
    beslenmeRes,
    yaziRes,
    kelimeRes,
    habits,
    logs,
    icerikStats,
  ] = await Promise.all([
    sb
      .from("yapilacaklar")
      .select("id, baslik, bitis_tarihi, oncelik")
      .eq("oncelik", "acil")
      .eq("tamamlandi", false)
      .order("bitis_tarihi", { ascending: true, nullsFirst: false })
      .limit(5),
    sb.from("gunluk").select("id, icerik").eq("tarih", bugun).maybeSingle(),
    sb
      .from("books")
      .select("id, title, author, page_count, progress_percent")
      .eq("status", "reading")
      .eq("is_featured_current", true)
      .maybeSingle(),
    sb
      .from("books")
      .select("id, title, author, page_count, progress_percent")
      .eq("status", "reading")
      .order("last_progress_update_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from("spor_gunlugu")
      .select("id, tarih")
      .gte("tarih", ayBasi)
      .lte("tarih", bugun),
    sb.from("beslenme_gunlugu").select("ai_analiz").eq("tarih", bugun),
    sb
      .from("writings")
      .select("id, title, durum, updated_at")
      .order("updated_at", { ascending: false })
      .limit(3),
    sb
      .from("dil_kelimeler")
      .select("son_tekrar, olusturma_tarihi")
      .or(`son_tekrar.gte.${streakFrom},olusturma_tarihi.gte.${streakFrom}`)
      .limit(400),
    listAliskanliklar(),
    listAliskanlikKayitlari({ from: streakFrom, to: bugun }),
    getIcDashboardStats().catch(() => null),
  ]);

  const acilTodos: DashboardTodo[] = (acilRes.data ?? []).map((r) => ({
    id: String(r.id),
    baslik: String(r.baslik ?? ""),
    bitis_tarihi: (r.bitis_tarihi as string | null) ?? null,
    oncelik: String(r.oncelik ?? "acil"),
  }));

  const bugunNotlar: DashboardNot[] = gunlukRes.data
    ? [{ id: String(gunlukRes.data.id), icerik: String(gunlukRes.data.icerik ?? "") }]
    : [];

  const bookRow = featuredRes.data ?? readingRes.data ?? null;
  const yuzdeRaw =
    bookRow && typeof bookRow.progress_percent === "number"
      ? Math.max(0, Math.min(100, Math.round(bookRow.progress_percent)))
      : null;
  const okuyorumKitap: DashboardKitap | null = bookRow
    ? {
        id: String(bookRow.id),
        baslik: String(bookRow.title ?? ""),
        yazar: (bookRow.author as string | null) ?? null,
        sayfa_toplam:
          typeof bookRow.page_count === "number" ? bookRow.page_count : null,
        yuzde: yuzdeRaw,
      }
    : null;

  const sporTarihler = new Set(
    (sporRes.data ?? []).map((s) => String(s.tarih ?? "")).filter(Boolean)
  );
  const sporGunleri = sporTarihler.size;
  const bugunSpor = sporTarihler.has(bugun);

  const toplamKalori = Math.round(
    (beslenmeRes.data ?? []).reduce((sum, row) => {
      const analiz = row.ai_analiz as { tahmini_kalori?: number } | null;
      return sum + (Number(analiz?.tahmini_kalori) || 0);
    }, 0)
  );

  const yazilar: DashboardYazi[] = (yaziRes.data ?? []).map((y) => ({
    id: String(y.id),
    baslik: String(y.title ?? ""),
    durum: String(y.durum ?? "taslak"),
    updated_at: String(y.updated_at ?? ""),
  }));

  const dilGunleri = new Set<string>();
  for (const k of kelimeRes.data ?? []) {
    const a = isoFromTimestamp(k.son_tekrar);
    const b = isoFromTimestamp(k.olusturma_tarihi);
    if (a) dilGunleri.add(a);
    if (b) dilGunleri.add(b);
  }
  const dilStreak = consecutiveDayStreak(dilGunleri, bugun);
  const habitStreak = habits.reduce(
    (max, h) => Math.max(max, calcStreak(logs, h, bugun)),
    0
  );
  const streak = Math.max(dilStreak, habitStreak);

  const icerikBugun: DashboardIcerik[] = (icerikStats?.todayPlanned ?? [])
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      baslik: i.baslik,
      hesap_ad: i.hesap_ad,
      hesap_renk: i.hesap_renk,
    }));

  const hour = istanbulHour();
  const selam =
    hour < 12 ? "Günaydın ☀️" : hour < 18 ? "Merhaba 👋" : "İyi günler ✨";

  return {
    selam,
    tarih: formatIstanbulLong(bugun),
    bugunISO: bugun,
    acilTodos,
    bugunNotlar,
    okuyorumKitap,
    kitapYuzde: yuzdeRaw,
    sporGunleri,
    bugunSpor,
    toplamKalori,
    yazilar,
    streak,
    icerikBugun,
    icerikGeciken: icerikStats?.overdue.length ?? 0,
  };
}
