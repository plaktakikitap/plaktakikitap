import { NextRequest, NextResponse } from "next/server";
import { getWorksAdmin, createWorksItem } from "@/lib/works";
import type { WorksItemType, WorksVisibility } from "@/lib/works";

export async function GET() {
  const items = await getWorksAdmin();
  return NextResponse.json(items);
}

function parseBody(body: unknown): {
  type: WorksItemType;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  tags?: string[];
  url?: string | null;
  external_url?: string | null;
  image_url?: string | null;
  meta?: Record<string, unknown>;
  sort_order?: number;
  is_featured?: boolean;
  visibility?: WorksVisibility;
} | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const type = b.type as string;
  const validTypes = ["youtube", "art", "photo", "experience", "project", "certificate", "software", "cv_role"];
  if (!validTypes.includes(type)) return null;
  return {
    type: type as WorksItemType,
    title: typeof b.title === "string" ? b.title.trim() : "",
    subtitle: b.subtitle != null ? String(b.subtitle).trim() : null,
    description: b.description != null ? String(b.description).trim() : null,
    tags: Array.isArray(b.tags) ? b.tags.map(String) : [],
    url: b.url != null ? String(b.url).trim() || null : null,
    external_url: b.external_url != null ? String(b.external_url).trim() || null : null,
    image_url: b.image_url != null ? String(b.image_url).trim() || null : null,
    meta: b.meta && typeof b.meta === "object" && !Array.isArray(b.meta) ? (b.meta as Record<string, unknown>) : {},
    sort_order: typeof b.sort_order === "number" ? b.sort_order : 0,
    is_featured: !!b.is_featured,
    visibility: (b.visibility === "unlisted" || b.visibility === "private" ? b.visibility : "public") as WorksVisibility,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = parseBody(body);
    if (!input) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    const result = await createWorksItem(input);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
