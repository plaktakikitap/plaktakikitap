import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const artist = String(form.get("artist") ?? "").trim();
  const cover_url = String(form.get("cover_url") ?? "").trim();
  const duration_sec = Number(form.get("duration_sec") ?? 180) || 180;
  const sort_order = Number(form.get("sort_order") ?? 0) || 0;

  if (!title || !artist) {
    return NextResponse.redirect(new URL("/admin?err=tracks_required", req.url));
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Veritabanı bağlantısı yapılamadı.";
    return NextResponse.redirect(new URL("/admin?err=tracks&msg=" + encodeURIComponent(msg), req.url));
  }
  const { error } = await supabase.from("now_tracks").insert({
    title,
    artist,
    cover_url: cover_url || null,
    duration_sec,
    sort_order,
    is_active: true,
  });

  if (error) {
    return NextResponse.redirect(new URL("/admin?err=tracks&msg=" + encodeURIComponent(error.message), req.url));
  }
  return NextResponse.redirect(new URL("/admin?toast=saved", req.url));
}
