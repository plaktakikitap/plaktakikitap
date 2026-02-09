import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/admin-auth";

const VALID_TYPES = [
  "photo", "polaroid", "sticker", "postit", "tape", "paperclip",
  "text", "doodle", "coffee_stain",
] as const;

export async function POST(request: NextRequest) {
  const ok = await verifyAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const {
      page_id,
      page_side = "right",
      type,
      asset_url = null,
      text_content = null,
      x = 50,
      y = 50,
      rotation = 0,
      scale = 1,
      z_index = 1,
      style_json = {},
    } = body;

    if (!page_id || typeof type !== "string" || !VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
      return NextResponse.json({ error: "Invalid page_id or type" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("planner_items")
      .insert({
        page_id,
        page_side: page_side === "left" ? "left" : "right",
        type,
        asset_url: asset_url ?? null,
        text_content: text_content ?? null,
        x: Number(x) ?? 50,
        y: Number(y) ?? 50,
        rotation: Number(rotation) ?? 0,
        scale: Number(scale) ?? 1,
        z_index: Number(z_index) ?? 1,
        style_json: style_json ?? {},
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
