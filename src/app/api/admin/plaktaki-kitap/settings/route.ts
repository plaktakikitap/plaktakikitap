import { NextRequest, NextResponse } from "next/server";
import { getPlaktakiKitapSettings, updatePlaktakiKitapSettings } from "@/lib/plaktaki-kitap";

export async function GET() {
  const settings = await getPlaktakiKitapSettings();
  if (!settings) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const payload = {
      intro_text: typeof b.intro_text === "string" ? b.intro_text : undefined,
      youtube_channel_url: typeof b.youtube_channel_url === "string" ? b.youtube_channel_url : undefined,
      youtube_channel_id: typeof b.youtube_channel_id === "string" ? b.youtube_channel_id : undefined,
      spotify_profile_url: b.spotify_profile_url !== undefined ? (b.spotify_profile_url == null ? null : String(b.spotify_profile_url).trim() || null) : undefined,
    };
    const result = await updatePlaktakiKitapSettings(payload);
    if (!result) return NextResponse.json({ error: "Update failed" }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
