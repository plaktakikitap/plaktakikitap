import { NextRequest, NextResponse } from "next/server";
import { deleteNot, updateNot } from "@/lib/kisisel/notlar";
import type { NotRenk } from "@/types/kisisel";
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
    const result = await updateNot(id, {
      baslik: typeof body.baslik === "string" ? body.baslik : undefined,
      icerik:
        body.icerik === null || typeof body.icerik === "string"
          ? body.icerik
          : undefined,
      renk: body.renk as NotRenk | undefined,
      etiket: Array.isArray(body.etiket) ? body.etiket : undefined,
      tarih:
        body.tarih === null || typeof body.tarih === "string"
          ? body.tarih
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
  const result = await deleteNot(id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
