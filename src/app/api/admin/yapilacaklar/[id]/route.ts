import { NextRequest, NextResponse } from "next/server";
import { deleteYapilacak, updateYapilacak } from "@/lib/kisisel/yapilacaklar";
import type { Oncelik } from "@/types/kisisel";
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
    const result = await updateYapilacak(id, {
      baslik: typeof body.baslik === "string" ? body.baslik : undefined,
      tamamlandi:
        typeof body.tamamlandi === "boolean" ? body.tamamlandi : undefined,
      oncelik: body.oncelik as Oncelik | undefined,
      bitis_tarihi:
        body.bitis_tarihi === null || typeof body.bitis_tarihi === "string"
          ? body.bitis_tarihi
          : undefined,
      kategori:
        body.kategori === null || typeof body.kategori === "string"
          ? body.kategori
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
  const result = await deleteYapilacak(id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
