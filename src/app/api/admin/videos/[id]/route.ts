import { NextRequest, NextResponse } from "next/server";
import { updateVideo, deleteVideo } from "@/lib/videos";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const payload: {
      type?: "normal_video" | "audio_book";
      youtube_url?: string;
      title?: string;
      description?: string | null;
      thumbnail_url?: string | null;
      published_at?: string | null;
      is_featured?: boolean;
      sort_order?: number;
    } = {};
    if (b.type === "audio_book" || b.type === "normal_video") payload.type = b.type;
    if (typeof b.youtube_url === "string") payload.youtube_url = b.youtube_url.trim();
    if (typeof b.title === "string") payload.title = b.title.trim();
    if (b.description !== undefined) payload.description = b.description != null ? String(b.description).trim() || null : null;
    if (b.thumbnail_url !== undefined) payload.thumbnail_url = b.thumbnail_url != null ? String(b.thumbnail_url).trim() || null : null;
    if (b.published_at !== undefined) payload.published_at = b.published_at != null ? String(b.published_at) : null;
    if (typeof b.is_featured === "boolean") payload.is_featured = b.is_featured;
    if (typeof b.sort_order === "number") payload.sort_order = b.sort_order;
    const result = await updateVideo(id, payload);
    if (!result) return NextResponse.json({ error: "Update failed" }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deleteVideo(id);
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
