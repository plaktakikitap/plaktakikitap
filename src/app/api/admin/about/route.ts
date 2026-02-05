import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TimelineEntry = {
  id?: string;
  year_or_period: string;
  paragraph_text: string;
  associated_images: { url: string; caption?: string }[];
  order_index: number;
  is_highlight?: boolean;
};

/** Admin: Create timeline entry */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TimelineEntry;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("about_timeline")
      .insert({
        year_or_period: body.year_or_period?.trim() ?? "",
        paragraph_text: body.paragraph_text?.trim() ?? "",
        associated_images: Array.isArray(body.associated_images) ? body.associated_images : [],
        order_index: typeof body.order_index === "number" ? body.order_index : 0,
        is_highlight: !!body.is_highlight,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
