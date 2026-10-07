import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import { parseVucutOlcum, upsertVucutOlcum } from "@/lib/takip/vucut";
import type { VucutOlcumAlani } from "@/types/takip";

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    const degerler =
      body.degerler && typeof body.degerler === "object"
        ? (body.degerler as Partial<Record<VucutOlcumAlani, unknown>>)
        : {};
    const parsed = parseVucutOlcum({
      tarih: body.tarih,
      notlar: body.notlar,
      degerler,
    });
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const result = await upsertVucutOlcum(parsed);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
