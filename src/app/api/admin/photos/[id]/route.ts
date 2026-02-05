import { NextRequest, NextResponse } from "next/server";
import { updatePhoto, deletePhoto } from "@/lib/photos";

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
      image_url?: string;
      caption?: string | null;
      shot_at?: string | null;
      type?: "analog" | "digital" | "other" | null;
      tags?: string[];
      camera?: string | null;
      year?: number | null;
    } = {};
    if (typeof b.image_url === "string") payload.image_url = b.image_url.trim();
    if (b.caption !== undefined) payload.caption = b.caption != null ? String(b.caption).trim() || null : null;
    if (b.shot_at !== undefined) payload.shot_at = b.shot_at != null ? String(b.shot_at).trim() || null : null;
    if (b.type !== undefined) {
      const t = b.type != null ? String(b.type).trim() : null;
      payload.type = t && ["analog", "digital", "other"].includes(t) ? (t as "analog" | "digital" | "other") : null;
    }
    if (Array.isArray(b.tags)) payload.tags = b.tags.map(String);
    if (b.camera !== undefined) payload.camera = b.camera != null ? String(b.camera).trim() || null : null;
    if (b.year !== undefined) payload.year = typeof b.year === "number" ? b.year : Number.isNaN(Number(b.year)) ? null : Number(b.year);
    const result = await updatePhoto(id, payload);
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
  const ok = await deletePhoto(id);
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
