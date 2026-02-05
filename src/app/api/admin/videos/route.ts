import { NextRequest, NextResponse } from "next/server";
import { getVideosAdmin, createVideo } from "@/lib/videos";

export async function GET() {
  const videos = await getVideosAdmin();
  return NextResponse.json(videos);
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
    const type = b.type === "audio_book" ? "audio_book" : "normal_video";
    const title = typeof b.title === "string" ? b.title.trim() : "";
    const description = typeof b.description === "string" ? b.description.trim() || null : null;
    const thumbnail_url = type === "audio_book" ? null : (typeof b.thumbnail_url === "string" ? b.thumbnail_url.trim() || null : null);
    const published_at = typeof b.published_at === "string" ? b.published_at : null;
    const is_featured = !!b.is_featured;
    const sort_order = typeof b.sort_order === "number" ? b.sort_order : 0;
    const result = await createVideo({
      type,
      youtube_url,
      title,
      description,
      thumbnail_url,
      published_at,
      is_featured,
      sort_order,
    });
    if (!result) return NextResponse.json({ error: "Create failed" }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
