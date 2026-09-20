import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  createSignedDownloadUrl,
  deleteKisiselDosya,
  listKisiselDosyalar,
} from "@/lib/kisisel/dosyalar";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const files = await listKisiselDosyalar();
  const file = files.find((f) => f.id === id);
  if (!file) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  }
  const signed = await createSignedDownloadUrl(file.depolama_yolu, 60);
  if ("error" in signed) {
    return NextResponse.json({ error: signed.error }, { status: 500 });
  }
  return NextResponse.json({ url: signed.url, dosya: file });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const result = await deleteKisiselDosya(id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
