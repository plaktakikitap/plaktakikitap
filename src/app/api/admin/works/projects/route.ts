import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("works_projects")
      .insert({
        title: String(body.title ?? "").trim(),
        slug: String(body.slug ?? "").trim(),
        summary: String(body.summary ?? "").trim(),
        link_url: String(body.link_url ?? "").trim(),
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
