import { NextRequest, NextResponse } from "next/server";
import { createBeslenme, listBeslenme } from "@/lib/takip/beslenme";
import type { BeslenmeAiAnaliz, BeslenmeOgun } from "@/types/takip";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const from = req.nextUrl.searchParams.get("from") || undefined;
  const to = req.nextUrl.searchParams.get("to") || undefined;
  const items = await listBeslenme({ from, to, limit: 200 });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    const result = await createBeslenme({
      tarih: typeof body.tarih === "string" ? body.tarih : new Date().toISOString().slice(0, 10),
      ogun: body.ogun as BeslenmeOgun,
      yenen: typeof body.yenen === "string" ? body.yenen : "",
      ai_analiz: (body.ai_analiz as BeslenmeAiAnaliz | null) ?? null,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
