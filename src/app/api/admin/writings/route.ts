import { NextRequest, NextResponse } from "next/server";
import { getWritingsPublic, createWriting } from "@/lib/writings";

export async function GET() {
  const items = await getWritingsPublic();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const category = ["denemeler", "siirler", "diger"].includes(String(b.category)) ? (b.category as "denemeler" | "siirler" | "diger") : "diger";
    const title = typeof b.title === "string" ? b.title.trim() : "";
    const bodyHtml = typeof b.body === "string" ? b.body : "";
    const published_at = typeof b.published_at === "string" ? b.published_at : undefined;
    const tefrika_issue = typeof b.tefrika_issue === "string" ? b.tefrika_issue.trim() || null : null;
    const external_url = typeof b.external_url === "string" ? b.external_url.trim() || null : null;
    const result = await createWriting({ category, title, body: bodyHtml, published_at, tefrika_issue, external_url });
    if (!result) return NextResponse.json({ error: "Create failed" }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
