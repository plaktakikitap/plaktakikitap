import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import { istanbulTodayISO, startOfIsoWeekISO } from "@/lib/date/istanbul";
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
  gunWriteSchema,
  habitWriteSchema,
  kayitWriteSchema,
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
  const [habits, logs, gun, reviews] = await Promise.all([
    listAliskanliklar({ includeInactive: true, includeArchived: true }),
    listAliskanlikKayitlari({ from, to }),
    getAliskanlikGunu(tarih),
    listHaftalikDegerlendirmeler(),
  ]);
  return NextResponse.json({
    habits,
    logs,
    gun,
    reviews,
    today: istanbulTodayISO(),
    hafta_baslangici: startOfIsoWeekISO(istanbulTodayISO()),
  });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";

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
        tarih:
          typeof body.tarih === "string" ? body.tarih : istanbulTodayISO(),
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
        tarih:
          typeof body.tarih === "string" ? body.tarih : istanbulTodayISO(),
      });
      if (!parsed.success) return bad("Kayıt bulunamadı.");
      const result = await upsertAliskanlikKayit({
        ...parsed.data,
        geri_al: true,
      });
      if ("error" in result) return bad(result.error);
      return NextResponse.json(result);
    }

    if (action === "gun-modu") {
      const parsed = gunWriteSchema.safeParse({
        ...body,
        tarih:
          typeof body.tarih === "string" ? body.tarih : istanbulTodayISO(),
      });
      if (!parsed.success) return bad("Geçersiz gün modu.");
      const result = await upsertAliskanlikGunu(parsed.data);
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
            : startOfIsoWeekISO(istanbulTodayISO()),
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
