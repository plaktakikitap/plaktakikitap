import { NextRequest, NextResponse } from "next/server";
import { deleteKaralama, updateKaralama } from "@/lib/karalamalar";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const payload: {
      baslik?: string;
      icerik?: string;
      slug?: string;
      yayinda?: boolean;
    } = {};
    if (typeof b.baslik === "string") payload.baslik = b.baslik;
    if (typeof b.icerik === "string") payload.icerik = b.icerik;
    if (typeof b.slug === "string") payload.slug = b.slug;
    if (typeof b.yayinda === "boolean") payload.yayinda = b.yayinda;

    const result = await updateKaralama(id, payload);
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
  context: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await context.params;
  const ok = await deleteKaralama(id);
  if (!ok) {
    return NextResponse.json({ error: "Silinemedi." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
