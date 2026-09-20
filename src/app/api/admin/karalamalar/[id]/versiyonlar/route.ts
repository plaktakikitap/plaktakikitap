import { NextRequest, NextResponse } from "next/server";
import { getKaralamaVersiyonlar } from "@/lib/karalamalar";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await context.params;
  const versiyonlar = await getKaralamaVersiyonlar(id);
  return NextResponse.json(versiyonlar);
}
