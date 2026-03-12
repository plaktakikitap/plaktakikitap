import { NextResponse } from "next/server";
import { getMusicCurrentState } from "@/lib/music";

export const dynamic = "force-dynamic";

/** Senkron çalma: sunucu zamanı + şu an hangi parça, kaçıncı saniye. */
export async function GET() {
  const state = await getMusicCurrentState(Date.now());
  return NextResponse.json(state);
}
