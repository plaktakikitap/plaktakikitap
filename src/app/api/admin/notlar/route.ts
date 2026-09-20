import { NextRequest, NextResponse } from "next/server";
import { createNot, listNotlar } from "@/lib/kisisel/notlar";
import type { NotRenk } from "@/types/kisisel";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const items = await listNotlar();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    const result = await createNot({
      baslik: typeof body.baslik === "string" ? body.baslik : "",
      icerik: typeof body.icerik === "string" ? body.icerik : null,
      renk: body.renk as NotRenk | undefined,
      etiket: Array.isArray(body.etiket) ? body.etiket : [],
      tarih: typeof body.tarih === "string" ? body.tarih : null,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
