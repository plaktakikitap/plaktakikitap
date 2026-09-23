import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  createAliskanlik,
  listAliskanlikKayitlari,
  listAliskanliklar,
  setAliskanlikAktif,
  toggleAliskanlikKayit,
} from "@/lib/takip/aliskanliklar";

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const from = req.nextUrl.searchParams.get("from") || undefined;
  const to = req.nextUrl.searchParams.get("to") || undefined;
  const [habits, logs] = await Promise.all([
    listAliskanliklar({ includeInactive: true }),
    listAliskanlikKayitlari({ from, to }),
  ]);
  return NextResponse.json({ habits, logs });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    if (body?.action === "create") {
      const result = await createAliskanlik({
        ad: typeof body.ad === "string" ? body.ad : "",
        aciklama: typeof body.aciklama === "string" ? body.aciklama : null,
      });
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }
    if (body?.action === "set-aktif") {
      const result = await setAliskanlikAktif(
        String(body.id),
        Boolean(body.aktif)
      );
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }
    if (body?.action === "toggle") {
      const result = await toggleAliskanlikKayit({
        aliskanlik_id: String(body.aliskanlik_id),
        tarih:
          typeof body.tarih === "string"
            ? body.tarih
            : new Date().toISOString().slice(0, 10),
        tamamlandi: Boolean(body.tamamlandi),
      });
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
