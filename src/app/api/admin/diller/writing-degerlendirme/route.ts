import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import { degerlendirYazi } from "@/lib/takip/dil-yazi-degerlendirme";
import { isDil } from "@/types/dil-ogrenme";

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { metin?: unknown; dil?: unknown };
    const metin = typeof body.metin === "string" ? body.metin.trim() : "";
    const dil = typeof body.dil === "string" ? body.dil : "";

    if (!metin || !dil) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }
    if (!isDil(dil)) {
      return NextResponse.json({ error: "Geçersiz dil." }, { status: 400 });
    }

    const sonuc = await degerlendirYazi(metin, dil);
    if (sonuc.ok) return NextResponse.json(sonuc.data);
    if (sonuc.hata === "AI yanıtı alınamadı") {
      return NextResponse.json({ puan: null, hata: sonuc.hata });
    }
    return NextResponse.json({
      puan: sonuc.puan,
      oneri: sonuc.oneri,
      hata: sonuc.hata,
    });
  } catch (err) {
    console.error("writing-degerlendirme:", err);
    return NextResponse.json(
      { error: "Değerlendirme sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
