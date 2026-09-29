import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  addDaysISO,
  istanbulHour,
  istanbulTodayISO,
  startOfIsoWeekISO,
} from "@/lib/date/istanbul";
import {
  createAliskanlik,
  etkinlestirAsama,
  getAliskanlikGunu,
  kurHazirPlan,
  listAliskanlikKayitlari,
  listAliskanliklar,
  listHaftalikDegerlendirmeler,
  planOnizleme,
  setAliskanlikAktif,
  setAliskanlikArsiv,
  updateAliskanlik,
  upsertAliskanlikGunu,
  upsertAliskanlikKayit,
  upsertHaftalikDegerlendirme,
} from "@/lib/takip/aliskanliklar";
import {
  createDurtu,
  getAksamKayit,
  getAksamSablon,
  listCevreAlanlari,
  listDurtuler,
  saveAksamSablon,
  updateCevreAlani,
  updateDurtu,
  upsertAksamKayit,
} from "@/lib/takip/aliskanlik-anlik";
import { missedLastPlanned } from "@/lib/takip/aliskanlik-schedule";
import { minOncelik } from "@/lib/takip/aliskanlik-now";
import {
  aksamWriteSchema,
  cevreWriteSchema,
  durtuCreateSchema,
  durtuUpdateSchema,
  gunWriteSchema,
  habitWriteSchema,
  kayitWriteSchema,
  oneriEylemSchema,
  reviewWriteSchema,
} from "@/lib/takip/aliskanlik-schemas";
import type { AliskanlikKayitEkstra } from "@/types/takip";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const from = req.nextUrl.searchParams.get("from") || undefined;
  const to = req.nextUrl.searchParams.get("to") || undefined;
  const tarih =
    req.nextUrl.searchParams.get("tarih") || istanbulTodayISO();
  const durtuFrom = addDaysISO(tarih, -60);
  const [
    habits,
    logs,
    gun,
    reviews,
    aksam,
    aksamSablon,
    cevre,
    durtuler,
  ] = await Promise.all([
    listAliskanliklar({ includeInactive: true, includeArchived: true }),
    listAliskanlikKayitlari({ from, to }),
    getAliskanlikGunu(tarih),
    listHaftalikDegerlendirmeler(),
    getAksamKayit(tarih),
    getAksamSablon(),
    listCevreAlanlari(tarih),
    listDurtuler(durtuFrom),
  ]);
  return NextResponse.json({
    habits,
    logs,
    gun,
    reviews,
    aksam,
    aksamSablon,
    cevre,
    durtuler,
    today: istanbulTodayISO(),
    hour: istanbulHour(),
    hafta_baslangici: startOfIsoWeekISO(istanbulTodayISO()),
  });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";
    const today = istanbulTodayISO();

    if (action === "create") {
      const parsed = habitWriteSchema.safeParse(body);
      if (!parsed.success) {
        return bad(parsed.error.issues[0]?.message || "Geçersiz alan.");
      }
      const result = await createAliskanlik(parsed.data);
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "update") {
      const id = typeof body.id === "string" ? body.id : "";
      if (!id) return bad("Kayıt bulunamadı.");
      const parsed = habitWriteSchema.partial().safeParse(body);
      if (!parsed.success) {
        return bad(parsed.error.issues[0]?.message || "Geçersiz alan.");
      }
      const result = await updateAliskanlik(id, parsed.data);
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "set-aktif") {
      const id = typeof body.id === "string" ? body.id : "";
      if (!id) return bad("Kayıt bulunamadı.");
      const result = await setAliskanlikAktif(id, Boolean(body.aktif));
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "arsivle") {
      const id = typeof body.id === "string" ? body.id : "";
      if (!id) return bad("Kayıt bulunamadı.");
      const result = await setAliskanlikArsiv(id, body.arsivlendi !== false);
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "toggle" || action === "kayit" || action === "alt-adim") {
      const parsed = kayitWriteSchema.safeParse({
        ...body,
        tarih: typeof body.tarih === "string" ? body.tarih : today,
      });
      if (!parsed.success) {
        return bad(parsed.error.issues[0]?.message || "Geçersiz kayıt.");
      }
      const result = await upsertAliskanlikKayit({
        ...parsed.data,
        ekstra: parsed.data.ekstra as AliskanlikKayitEkstra | undefined,
      });
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "geri-al") {
      const parsed = kayitWriteSchema.pick({
        aliskanlik_id: true,
        tarih: true,
      }).safeParse({
        ...body,
        tarih: typeof body.tarih === "string" ? body.tarih : today,
      });
      if (!parsed.success) return bad("Kayıt bulunamadı.");
      const result = await upsertAliskanlikKayit({
        ...parsed.data,
        geri_al: true,
      });
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "gun-modu" || action === "baglam") {
      const parsed = gunWriteSchema.safeParse({
        ...body,
        tarih: typeof body.tarih === "string" ? body.tarih : today,
      });
      if (!parsed.success) return bad("Geçersiz gün kaydı.");
      const result = await upsertAliskanlikGunu(parsed.data);
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "oneri") {
      const id = typeof body.aliskanlik_id === "string" ? body.aliskanlik_id : "";
      const eylem = oneriEylemSchema.safeParse(body.eylem);
      if (!id || !eylem.success) return bad("Geçersiz öneri.");
      const tarih = typeof body.tarih === "string" ? body.tarih : today;
      const mevcut = await getAliskanlikGunu(tarih);
      const atlanan = [...(mevcut?.atlanan_oneriler ?? [])];
      const uygunDegil = [...(mevcut?.uygun_degil ?? [])];
      if (eylem.data === "baska" && !atlanan.includes(id)) atlanan.push(id);
      if (eylem.data === "uygun_degil" && !uygunDegil.includes(id)) {
        uygunDegil.push(id);
      }
      if (eylem.data === "yapildi" && !atlanan.includes(id)) atlanan.push(id);
      const gun = await upsertAliskanlikGunu({
        tarih,
        atlanan_oneriler: atlanan,
        uygun_degil: uygunDegil,
      });
      if ("error" in gun) return bad(gun.error);

      let kayit = null;
      if (eylem.data === "yapildi") {
        const habits = await listAliskanliklar({
          includeInactive: true,
          includeArchived: true,
        });
        const habit = habits.find((h) => h.id === id);
        const logs = await listAliskanlikKayitlari({ from: tarih, to: tarih });
        const missed = habit
          ? missedLastPlanned(habit, tarih, logs)
          : false;
        const useMin = minOncelik(
          gun.gun_modu,
          gun.baglam,
          missed
        );
        const result = await upsertAliskanlikKayit({
          aliskanlik_id: id,
          tarih,
          durum: useMin ? "minimum" : "hedef",
          gun_modu: gun.gun_modu,
        });
        if ("error" in result) return bad(result.error);
        kayit = result;
      }
      return NextResponse.json({ gun, kayit });
    }

    if (action === "aksam") {
      const parsed = aksamWriteSchema.safeParse({
        ...body,
        tarih: typeof body.tarih === "string" ? body.tarih : today,
      });
      if (!parsed.success) return bad("Geçersiz akşam kaydı.");
      if (parsed.data.adimlar_sablon) {
        const sablon = await saveAksamSablon(parsed.data.adimlar_sablon);
        if ("error" in sablon) return bad(sablon.error);
        return NextResponse.json({ sablon });
      }
      const result = await upsertAksamKayit(parsed.data);
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "cevre") {
      const parsed = cevreWriteSchema.safeParse(body);
      if (!parsed.success) return bad("Geçersiz çevre kaydı.");
      const { id, ...patch } = parsed.data;
      const result = await updateCevreAlani(id, patch, today);
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "durtu-ac") {
      const parsed = durtuCreateSchema.safeParse(body);
      if (!parsed.success) return bad("Geçersiz dürtü kaydı.");
      const result = await createDurtu({
        ...parsed.data,
        tarih: today,
        saat: istanbulHour(),
      });
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "durtu-kapat") {
      const parsed = durtuUpdateSchema.safeParse(body);
      if (!parsed.success) return bad("Geçersiz dürtü güncellemesi.");
      const { id, ...patch } = parsed.data;
      const result = await updateDurtu(id, patch);
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "plan-onizle") {
      const maxAsama = Number(body.maxAsama) || 1;
      const habits = await listAliskanliklar({
        includeInactive: true,
        includeArchived: true,
      });
      return NextResponse.json(planOnizleme(habits, maxAsama));
    }

    if (action === "plan-kur") {
      const maxAsama = Math.min(4, Math.max(1, Number(body.maxAsama) || 1));
      const result = await kurHazirPlan({ maxAsama });
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "asama-etkinlestir") {
      const asama = Math.min(4, Math.max(1, Number(body.asama) || 1));
      const result = await etkinlestirAsama(asama);
      if ("error" in result) return bad(result.error);
      return NextResponse.json({ updated: result });
    }

    if (action === "haftalik") {
      const parsed = reviewWriteSchema.safeParse({
        ...body,
        hafta_baslangici:
          typeof body.hafta_baslangici === "string"
            ? body.hafta_baslangici
            : startOfIsoWeekISO(today),
      });
      if (!parsed.success) return bad("Geçersiz değerlendirme.");
      const result = await upsertHaftalikDegerlendirme(parsed.data);
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    return bad("Geçersiz işlem.");
  } catch {
    return bad("Geçersiz istek.");
  }
}
