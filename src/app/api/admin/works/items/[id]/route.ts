import { NextRequest, NextResponse } from "next/server";
import { updateWorksItem, deleteWorksItem } from "@/lib/works";
import type { WorksItemType, WorksVisibility } from "@/lib/works";

function parseBody(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  if (typeof b.type === "string") out.type = b.type as WorksItemType;
  if (typeof b.title === "string") out.title = b.title.trim();
  if (b.subtitle !== undefined) out.subtitle = b.subtitle == null ? null : String(b.subtitle).trim();
  if (b.description !== undefined) out.description = b.description == null ? null : String(b.description).trim();
  if (Array.isArray(b.tags)) out.tags = b.tags.map(String);
  if (b.url !== undefined) out.url = b.url == null ? null : String(b.url).trim();
  if (b.external_url !== undefined) out.external_url = b.external_url == null ? null : String(b.external_url).trim();
  if (b.image_url !== undefined) out.image_url = b.image_url == null ? null : String(b.image_url).trim();
  if (b.meta !== undefined && typeof b.meta === "object" && !Array.isArray(b.meta)) out.meta = b.meta;
  if (typeof b.sort_order === "number") out.sort_order = b.sort_order;
  if (typeof b.is_featured === "boolean") out.is_featured = b.is_featured;
  if (b.visibility === "unlisted" || b.visibility === "private" || b.visibility === "public") out.visibility = b.visibility as WorksVisibility;
  return out;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const body = await req.json();
    const input = parseBody(body);
    if (!input || Object.keys(input).length === 0) return NextResponse.json({ error: "No updates" }, { status: 400 });
    const result = await updateWorksItem(id, input as Parameters<typeof updateWorksItem>[1]);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const result = await deleteWorksItem(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
