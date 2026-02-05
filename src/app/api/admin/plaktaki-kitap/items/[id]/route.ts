import { NextRequest, NextResponse } from "next/server";
import { updatePlaktakiKitapItem, deletePlaktakiKitapItem } from "@/lib/plaktaki-kitap";
import { parseYouTubeVideoId } from "@/lib/works-utils";

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
    const payload: {
      title?: string;
      description?: string | null;
      youtube_url?: string;
      custom_thumbnail_url?: string | null;
      tags?: string[];
      duration_min?: number | null;
      is_featured?: boolean;
      order_index?: number;
    } = {};
    if (typeof b.title === "string") payload.title = b.title.trim();
    if (b.description !== undefined) payload.description = b.description != null ? String(b.description).trim() || null : null;
    if (typeof b.youtube_url === "string") {
      const url = b.youtube_url.trim();
      if (parseYouTubeVideoId(url)) payload.youtube_url = url;
    }
    if (b.custom_thumbnail_url !== undefined) payload.custom_thumbnail_url = b.custom_thumbnail_url != null ? String(b.custom_thumbnail_url).trim() || null : null;
    if (Array.isArray(b.tags)) payload.tags = (b.tags as string[]).filter((t): t is string => typeof t === "string");
    if (b.duration_min !== undefined) payload.duration_min = typeof b.duration_min === "number" ? b.duration_min : null;
    if (typeof b.is_featured === "boolean") payload.is_featured = b.is_featured;
    if (typeof b.order_index === "number") payload.order_index = b.order_index;
    const result = await updatePlaktakiKitapItem(id, payload);
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
  const ok = await deletePlaktakiKitapItem(id);
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
