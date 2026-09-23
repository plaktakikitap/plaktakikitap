import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  createFinansKayit,
  listFinansKayitlari,
  listFinansKategoriler,
  createFinansKategori,
  deleteFinansKategori,
} from "@/lib/takip/finans";
import type { FinansTur } from "@/types/takip";

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const mode = req.nextUrl.searchParams.get("mode");
  if (mode === "kategoriler") {
    return NextResponse.json(await listFinansKategoriler());
  }
  const from = req.nextUrl.searchParams.get("from") || undefined;
  const to = req.nextUrl.searchParams.get("to") || undefined;
  return NextResponse.json(
    await listFinansKayitlari({ from, to, limit: 500 })
  );
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    if (body?.action === "create-kategori") {
      const result = await createFinansKategori({
        ad: typeof body.ad === "string" ? body.ad : "",
        tur: body.tur === "gelir" ? "gelir" : "gider",
        renk: typeof body.renk === "string" ? body.renk : undefined,
      });
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }
    if (body?.action === "delete-kategori") {
      const result = await deleteFinansKategori(String(body.id));
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    const result = await createFinansKayit({
      tarih:
        typeof body.tarih === "string"
          ? body.tarih
          : new Date().toISOString().slice(0, 10),
      tur: (body.tur === "gelir" ? "gelir" : "gider") as FinansTur,
      tutar: Number(body.tutar),
      kategori: typeof body.kategori === "string" ? body.kategori : "",
      notlar: typeof body.notlar === "string" ? body.notlar : null,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
