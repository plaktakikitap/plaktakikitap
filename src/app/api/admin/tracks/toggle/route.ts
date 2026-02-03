import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get("id") ?? "");

  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("now_tracks")
    .select("is_active")
    .eq("id", id)
    .maybeSingle();
  const next = !(data?.is_active ?? true);

  await supabase.from("now_tracks").update({ is_active: next }).eq("id", id);

  return NextResponse.redirect(new URL("/admin", req.url));
}
