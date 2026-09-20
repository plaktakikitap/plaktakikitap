import { NextRequest, NextResponse } from "next/server";
import { deleteDilNot, updateDilNot } from "@/lib/takip/diller";
import type { DilNotKategori } from "@/types/dil";
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
    const result = await updateDilNot(id, {
      baslik: typeof body.baslik === "string" ? body.baslik : undefined,
      icerik: typeof body.icerik === "string" ? body.icerik : undefined,
      kategori:
        body.kategori === null || typeof body.kategori === "string"
          ? (body.kategori as DilNotKategori | null)
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
  const result = await deleteDilNot(id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
