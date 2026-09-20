import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const form = await req.formData();
  const id = String(form.get("id") ?? "");

  if (!id) {
    return NextResponse.redirect(new URL("/secretgate?err=tracks", req.url));
  }

  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("now_tracks")
    .select("audio_url, cover_url")
    .eq("id", id)
    .maybeSingle();

  const paths: string[] = [];
  for (const url of [row?.audio_url, row?.cover_url]) {
    if (typeof url !== "string" || !url) continue;
    if (url.includes("/music/")) {
      const path = url.split("/music/")[1]?.split("?")[0];
      if (path) paths.push(decodeURIComponent(path));
    }
  }
  if (paths.length) {
    await supabase.storage.from("music").remove(paths);
  }

  const { error } = await supabase.from("now_tracks").delete().eq("id", id);

  if (error) {
    return NextResponse.redirect(new URL("/secretgate?err=tracks&msg=" + encodeURIComponent(error.message), req.url));
  }
  return NextResponse.redirect(new URL("/secretgate?toast=saved", req.url));
}
