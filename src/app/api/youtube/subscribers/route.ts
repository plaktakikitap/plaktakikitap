import { NextResponse } from "next/server";
import { getPlaktakiKitapSettings } from "@/lib/plaktaki-kitap";

export const dynamic = "force-dynamic";

/** Elle girilen YouTube abone sayısını döndürür (API çekme yok). */
export async function GET() {
  try {
    const settings = await getPlaktakiKitapSettings();
    const count = settings?.youtube_subscriber_count ?? null;
    return NextResponse.json({
      subscriberCount: typeof count === "number" ? count : null,
    });
  } catch {
    return NextResponse.json({ subscriberCount: null });
  }
}
