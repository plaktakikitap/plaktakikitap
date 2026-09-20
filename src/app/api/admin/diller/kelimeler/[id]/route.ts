import { NextRequest, NextResponse } from "next/server";
import { deleteDilKelime, updateDilKelime } from "@/lib/takip/diller";
import type { DilZorluk } from "@/types/dil";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();
    const result = await updateDilKelime(id, {
      kelime: typeof body.kelime === "string" ? body.kelime : undefined,
      anlam: typeof body.anlam === "string" ? body.anlam : undefined,
      ornek_cumle:
        body.ornek_cumle === null || typeof body.ornek_cumle === "string"
          ? body.ornek_cumle
          : undefined,
      telaffuz:
        body.telaffuz === null || typeof body.telaffuz === "string"
          ? body.telaffuz
          : undefined,
      arapca_yazi:
        body.arapca_yazi === null || typeof body.arapca_yazi === "string"
          ? body.arapca_yazi
          : undefined,
      zorluk: body.zorluk as DilZorluk | undefined,
      etiket: Array.isArray(body.etiket) ? body.etiket : undefined,
      ogrenildi:
        typeof body.ogrenildi === "boolean" ? body.ogrenildi : undefined,
      tekrar_sayisi:
        typeof body.tekrar_sayisi === "number" ? body.tekrar_sayisi : undefined,
      son_tekrar:
        body.son_tekrar === null || typeof body.son_tekrar === "string"
          ? body.son_tekrar
          : undefined,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const result = await deleteDilKelime(id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
