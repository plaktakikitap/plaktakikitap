import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const key = body.key === "cv_download_url" ? "cv_download_url" : null;
    if (!key) return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    const value = String(body.value ?? "").trim();
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("works_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
