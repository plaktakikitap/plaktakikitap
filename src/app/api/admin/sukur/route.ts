import { NextRequest, NextResponse } from "next/server";
import { listSukur, upsertSukur } from "@/lib/takip/sukur";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  return NextResponse.json(await listSukur());
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    const result = await upsertSukur({
      tarih:
        typeof body.tarih === "string"
          ? body.tarih
          : new Date().toISOString().slice(0, 10),
      madde_1: typeof body.madde_1 === "string" ? body.madde_1 : "",
      madde_2: typeof body.madde_2 === "string" ? body.madde_2 : "",
      madde_3: typeof body.madde_3 === "string" ? body.madde_3 : "",
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
