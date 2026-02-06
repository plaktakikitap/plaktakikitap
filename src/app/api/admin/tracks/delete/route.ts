import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const id = String(form.get("id") ?? "");

  if (!id) {
    return NextResponse.redirect(new URL("/admin?err=tracks", req.url));
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("now_tracks").delete().eq("id", id);

  if (error) {
    return NextResponse.redirect(new URL("/admin?err=tracks&msg=" + encodeURIComponent(error.message), req.url));
  }
  return NextResponse.redirect(new URL("/admin?toast=saved", req.url));
}
