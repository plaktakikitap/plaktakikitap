import { NextRequest, NextResponse } from "next/server";
import { getPhotosAdmin, createPhoto } from "@/lib/photos";

export async function GET() {
  const photos = await getPhotosAdmin();
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const image_url = typeof b.image_url === "string" ? b.image_url.trim() : "";
    if (!image_url) {
      return NextResponse.json({ error: "image_url required" }, { status: 400 });
    }
    const caption = b.caption != null ? String(b.caption).trim() || null : null;
    const shot_at = b.shot_at != null ? String(b.shot_at).trim() || null : null;
    const typeVal = b.type != null ? String(b.type).trim() || null : null;
    const type = typeVal && ["analog", "digital", "other"].includes(typeVal) ? typeVal : null;
    const tags = Array.isArray(b.tags) ? b.tags.map(String) : [];
    const camera = b.camera != null ? String(b.camera).trim() || null : null;
    const year = typeof b.year === "number" ? b.year : b.year != null ? parseInt(String(b.year), 10) : null;
    const result = await createPhoto({
      image_url,
      caption,
      shot_at,
      type: type as "analog" | "digital" | "other" | null,
      tags,
      camera,
      year: year ?? null,
    });
    if (!result) return NextResponse.json({ error: "Create failed" }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
