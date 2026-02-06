import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const id = String(form.get("id") ?? "");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("now_tracks")
    .select("is_active")
    .eq("id", id)
    .maybeSingle();
  const next = !(data?.is_active ?? true);

  const { error } = await supabase.from("now_tracks").update({ is_active: next }).eq("id", id);

  if (error) {
    return NextResponse.redirect(new URL("/admin?err=tracks&msg=" + encodeURIComponent(error.message), req.url));
  }
  return NextResponse.redirect(new URL("/admin?toast=saved", req.url));
}
