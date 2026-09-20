import { NextRequest, NextResponse } from "next/server";
import { deleteFinansKayit } from "@/lib/takip/finans";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const result = await deleteFinansKayit(id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
