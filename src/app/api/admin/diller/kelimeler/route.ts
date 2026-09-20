import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  createDilKelime,
  getDilStats,
  listDilKelimeler,
  listFlashcardKelimeler,
} from "@/lib/takip/diller";
import type { DilKodu, DilZorluk } from "@/types/dil";
import { DIL_LISTESI } from "@/types/dil";

function parseDil(v: string | null): DilKodu | null {
  return DIL_LISTESI.includes(v as DilKodu) ? (v as DilKodu) : null;
}

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const dil = parseDil(req.nextUrl.searchParams.get("dil"));
  if (!dil) {
    return NextResponse.json({ error: "dil gerekli." }, { status: 400 });
  }

  const mode = req.nextUrl.searchParams.get("mode");
  if (mode === "stats") {
    return NextResponse.json(await getDilStats(dil));
  }
  if (mode === "flashcard") {
    const onlyUnknown = req.nextUrl.searchParams.get("onlyUnknown") === "1";
    return NextResponse.json(
      await listFlashcardKelimeler(dil, { onlyUnknown })
    );
  }

  const q = req.nextUrl.searchParams.get("q") || undefined;
  const etiket = req.nextUrl.searchParams.get("etiket") || undefined;
  const zorluk = req.nextUrl.searchParams.get("zorluk") as DilZorluk | null;
  const ogrenildi =
    (req.nextUrl.searchParams.get("ogrenildi") as
      | "all"
      | "true"
      | "false"
      | null) || "all";
  const sort =
    (req.nextUrl.searchParams.get("sort") as "yeni" | "alfa" | "tekrar") ||
    "yeni";
  const limit = Number(req.nextUrl.searchParams.get("limit") || 40);
  const offset = Number(req.nextUrl.searchParams.get("offset") || 0);

  const result = await listDilKelimeler({
    dil,
    q,
    etiket,
    zorluk: zorluk || undefined,
    ogrenildi,
    sort,
    limit,
    offset,
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    const dil = parseDil(typeof body.dil === "string" ? body.dil : null);
    if (!dil) {
      return NextResponse.json({ error: "dil gerekli." }, { status: 400 });
    }
    const result = await createDilKelime({
      dil,
      kelime: typeof body.kelime === "string" ? body.kelime : "",
      anlam: typeof body.anlam === "string" ? body.anlam : "",
      ornek_cumle:
        typeof body.ornek_cumle === "string" ? body.ornek_cumle : null,
      telaffuz: typeof body.telaffuz === "string" ? body.telaffuz : null,
      arapca_yazi:
        typeof body.arapca_yazi === "string" ? body.arapca_yazi : null,
      zorluk: body.zorluk as DilZorluk | undefined,
      etiket: Array.isArray(body.etiket) ? body.etiket : [],
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
