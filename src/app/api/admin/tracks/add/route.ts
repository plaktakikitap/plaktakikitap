import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const form = await req.formData();
  const title = String(form.get("title") ?? "");
  const artist = String(form.get("artist") ?? "");
  const cover_url = String(form.get("cover_url") ?? "");
  const duration_sec = Number(form.get("duration_sec") ?? 180) || 180;
  const sort_order = Number(form.get("sort_order") ?? 0) || 0;

  const supabase = await supabaseServer();
  await supabase.from("now_tracks").insert({
    title,
    artist,
    cover_url: cover_url || null,
    duration_sec,
    sort_order,
    is_active: true,
  });

  return NextResponse.redirect(new URL("/admin", req.url));
}
