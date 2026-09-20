import { NextRequest, NextResponse } from "next/server";
import { createDilNot, listDilNotlar } from "@/lib/takip/diller";
import type { DilKodu, DilNotKategori } from "@/types/dil";
import { DIL_LISTESI } from "@/types/dil";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

function parseDil(v: string | null): DilKodu | null {
  return DIL_LISTESI.includes(v as DilKodu) ? (v as DilKodu) : null;
}

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const dil = parseDil(req.nextUrl.searchParams.get("dil"));
  if (!dil) {
    return NextResponse.json({ error: "dil gerekli." }, { status: 400 });
  }
  const kat = req.nextUrl.searchParams.get("kategori") as DilNotKategori | null;
  const items = await listDilNotlar(dil, kat || undefined);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    const dil = parseDil(typeof body.dil === "string" ? body.dil : null);
    if (!dil) {
      return NextResponse.json({ error: "dil gerekli." }, { status: 400 });
    }
    const result = await createDilNot({
      dil,
      baslik: typeof body.baslik === "string" ? body.baslik : "",
      icerik: typeof body.icerik === "string" ? body.icerik : "",
      kategori: body.kategori as DilNotKategori | null,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
