import { NextRequest, NextResponse } from "next/server";
import { reorderPlaktakiKitapItems } from "@/lib/plaktaki-kitap";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!Array.isArray(body?.orderedIds)) {
      return NextResponse.json({ error: "orderedIds array required" }, { status: 400 });
    }
    const orderedIds = (body.orderedIds as unknown[]).filter((id): id is string => typeof id === "string");
    const ok = await reorderPlaktakiKitapItems(orderedIds);
    if (!ok) return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
