import { NextRequest, NextResponse } from "next/server";
import { createSpor, listSpor } from "@/lib/takip/spor";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const from = req.nextUrl.searchParams.get("from") || undefined;
  const to = req.nextUrl.searchParams.get("to") || undefined;
  const items = await listSpor({ from, to, limit: 400 });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    const result = await createSpor({
      tarih:
        typeof body.tarih === "string"
          ? body.tarih
          : new Date().toISOString().slice(0, 10),
      aktivite: typeof body.aktivite === "string" ? body.aktivite : "",
      sure_dakika:
        body.sure_dakika != null ? Number(body.sure_dakika) : null,
      mesafe_km: body.mesafe_km != null ? Number(body.mesafe_km) : null,
      enerji_seviyesi:
        body.enerji_seviyesi != null ? Number(body.enerji_seviyesi) : null,
      notlar: typeof body.notlar === "string" ? body.notlar : null,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
