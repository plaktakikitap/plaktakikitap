import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  createKaralama,
  getKaralamalarAdmin,
} from "@/lib/karalamalar";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const items = await getKaralamalarAdmin();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const result = await createKaralama({
      baslik: typeof b.baslik === "string" ? b.baslik : "",
      icerik: typeof b.icerik === "string" ? b.icerik : "",
      slug: typeof b.slug === "string" ? b.slug : undefined,
      yayinda: typeof b.yayinda === "boolean" ? b.yayinda : true,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
