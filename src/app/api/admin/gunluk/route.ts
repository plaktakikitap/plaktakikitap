import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  listGunluk,
  searchGunluk,
  upsertGunluk,
} from "@/lib/takip/gunluk";
import type { RuhHali } from "@/types/takip";

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const q = req.nextUrl.searchParams.get("q");
  if (q) {
    return NextResponse.json(await searchGunluk(q));
  }
  return NextResponse.json(await listGunluk({ limit: 120 }));
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    const ruh = body.ruh_hali as string | null;
    const result = await upsertGunluk({
      tarih:
        typeof body.tarih === "string"
          ? body.tarih
          : new Date().toISOString().slice(0, 10),
      icerik: typeof body.icerik === "string" ? body.icerik : "",
      ruh_hali:
        ruh === "iyi" || ruh === "orta" || ruh === "zor"
          ? (ruh as RuhHali)
          : null,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
