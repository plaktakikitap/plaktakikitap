import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  createIcHesap,
  listIcHesaplar,
  updateIcHesap,
} from "@/lib/icerik";
import type { IcPlatform } from "@/types/icerik";

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const includeInactive =
    req.nextUrl.searchParams.get("all") === "1";
  return NextResponse.json(
    await listIcHesaplar({ includeInactive })
  );
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const body = await req.json();
    const platforms = Array.isArray(body.platformlar)
      ? (body.platformlar as IcPlatform[])
      : [];
    const result = await createIcHesap({
      ad: String(body.ad ?? ""),
      renk: String(body.renk ?? "#c9a65a"),
      platformlar: platforms,
      sira: typeof body.sira === "number" ? body.sira : undefined,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "id gerekli." }, { status: 400 });
    const result = await updateIcHesap(id, {
      ad: body.ad,
      renk: body.renk,
      platformlar: body.platformlar,
      aktif: body.aktif,
      sira: body.sira,
      hedef_iki_gunde_bir: body.hedef_iki_gunde_bir,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
