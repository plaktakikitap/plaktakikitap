import { NextRequest, NextResponse } from "next/server";
import { getPlaktakiKitapItems, createPlaktakiKitapItem } from "@/lib/plaktaki-kitap";
import { parseYouTubeVideoId } from "@/lib/works-utils";

export async function GET() {
  const items = await getPlaktakiKitapItems();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const youtube_url = typeof b.youtube_url === "string" ? b.youtube_url.trim() : "";
    if (!youtube_url) {
      return NextResponse.json({ error: "youtube_url required" }, { status: 400 });
    }
    const videoId = parseYouTubeVideoId(youtube_url);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }
    const type = b.type === "audio_book" ? "audio_book" : "video";
    const title = typeof b.title === "string" ? b.title.trim() : "";
    const description = typeof b.description === "string" ? b.description.trim() || null : null;
    const custom_thumbnail_url = type === "video" && typeof b.custom_thumbnail_url === "string" ? b.custom_thumbnail_url.trim() || null : null;
    const tags = Array.isArray(b.tags) ? (b.tags as string[]).filter((t): t is string => typeof t === "string") : [];
    const duration_min = typeof b.duration_min === "number" ? b.duration_min : typeof b.duration_min === "string" ? parseInt(b.duration_min, 10) : null;
    const is_featured = !!b.is_featured;
    const order_index = typeof b.order_index === "number" ? b.order_index : 0;
    const result = await createPlaktakiKitapItem({
      type,
      title: title || "Untitled",
      description,
      youtube_url,
      custom_thumbnail_url,
      tags: tags.length ? tags : undefined,
      duration_min: Number.isFinite(duration_min) ? duration_min : null,
      is_featured,
      order_index,
    });
    if (!result) return NextResponse.json({ error: "Create failed" }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
