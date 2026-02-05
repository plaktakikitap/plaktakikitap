import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const body = await req.json();
    const supabase = createAdminClient();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.image_url !== undefined) updates.image_url = String(body.image_url).trim();
    if (body.caption !== undefined) updates.caption = String(body.caption).trim();
    if (typeof body.order_index === "number") updates.order_index = body.order_index;
    const { error } = await supabase.from("works_art").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = createAdminClient();
  const { error } = await supabase.from("works_art").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
