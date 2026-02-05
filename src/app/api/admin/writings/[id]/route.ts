import { NextRequest, NextResponse } from "next/server";
import { updateWriting, deleteWriting } from "@/lib/writings";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const payload: { category?: "denemeler" | "siirler" | "diger"; title?: string; body?: string; published_at?: string | null; tefrika_issue?: string | null; external_url?: string | null } = {};
    if (["denemeler", "siirler", "diger"].includes(String(b.category))) payload.category = b.category as "denemeler" | "siirler" | "diger";
    if (typeof b.title === "string") payload.title = b.title.trim();
    if (typeof b.body === "string") payload.body = b.body;
    if (b.published_at !== undefined) payload.published_at = b.published_at != null ? String(b.published_at) : null;
    if (b.tefrika_issue !== undefined) payload.tefrika_issue = b.tefrika_issue != null ? String(b.tefrika_issue).trim() || null : null;
    if (b.external_url !== undefined) payload.external_url = b.external_url != null ? String(b.external_url).trim() || null : null;
    const result = await updateWriting(id, payload);
    if (!result) return NextResponse.json({ error: "Update failed" }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ok = await deleteWriting(id);
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
