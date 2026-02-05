import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TimelineEntry = {
  year_or_period?: string;
  paragraph_text?: string;
  associated_images?: { url: string; caption?: string }[];
  order_index?: number;
  is_highlight?: boolean;
};

/** Admin: Update timeline entry */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const body = (await req.json()) as TimelineEntry;
    const supabase = createAdminClient();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.year_or_period !== undefined) updates.year_or_period = String(body.year_or_period).trim();
    if (body.paragraph_text !== undefined) updates.paragraph_text = String(body.paragraph_text).trim();
    if (Array.isArray(body.associated_images)) updates.associated_images = body.associated_images;
    if (typeof body.order_index === "number") updates.order_index = body.order_index;
    if (typeof body.is_highlight === "boolean") updates.is_highlight = body.is_highlight;

    const { error } = await supabase.from("about_timeline").update(updates).eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/** Admin: Delete timeline entry */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("about_timeline").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
