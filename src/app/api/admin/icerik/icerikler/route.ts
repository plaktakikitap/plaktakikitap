import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  advanceIcIcerikDurum,
  createIcIcerik,
  deleteIcIcerik,
  listIcIcerikler,
  updateIcIcerik,
} from "@/lib/icerik";
import type { IcDurum, IcPlatform, IcTur } from "@/types/icerik";

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const hesapId = req.nextUrl.searchParams.get("hesap_id") || undefined;
  return NextResponse.json(await listIcIcerikler({ hesapId }));
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const body = await req.json();
    const platforms = Array.isArray(body.platforms)
      ? (body.platforms as IcPlatform[])
      : body.platform
        ? [body.platform as IcPlatform]
        : [];
    const result = await createIcIcerik({
      hesap_id: String(body.hesap_id ?? ""),
      tur: body.tur as IcTur,
      platforms,
      baslik: String(body.baslik ?? ""),
      aciklama: body.aciklama ?? null,
      durum: (body.durum as IcDurum) || "fikir",
      planlanan_tarih: body.planlanan_tarih ?? null,
      notlar: body.notlar ?? null,
      hatirlatma_zamani: body.hatirlatma_zamani ?? null,
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

    if (body.advance === true) {
      const result = await advanceIcIcerikDurum(id);
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    const result = await updateIcIcerik(id, {
      hesap_id: body.hesap_id,
      tur: body.tur,
      platform: body.platform,
      baslik: body.baslik,
      aciklama: body.aciklama,
      durum: body.durum,
      planlanan_tarih: body.planlanan_tarih,
      paylasim_tarihi: body.paylasim_tarihi,
      notlar: body.notlar,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "id gerekli." }, { status: 400 });
    const result = await deleteIcIcerik(id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
