import { NextRequest, NextResponse } from "next/server";
import { createYapilacak, listYapilacaklar } from "@/lib/kisisel/yapilacaklar";
import type { Oncelik } from "@/types/kisisel";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const items = await listYapilacaklar();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    const result = await createYapilacak({
      baslik: typeof body.baslik === "string" ? body.baslik : "",
      oncelik: body.oncelik as Oncelik | undefined,
      bitis_tarihi:
        typeof body.bitis_tarihi === "string" ? body.bitis_tarihi : null,
      kategori: typeof body.kategori === "string" ? body.kategori : null,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
