import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("works_art")
      .insert({
        image_url: String(body.image_url ?? "").trim(),
        caption: String(body.caption ?? "").trim(),
        order_index: typeof body.order_index === "number" ? body.order_index : 0,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
