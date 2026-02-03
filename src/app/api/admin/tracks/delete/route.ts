import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get("id") ?? "");

  const supabase = await supabaseServer();
  await supabase.from("now_tracks").delete().eq("id", id);

  return NextResponse.redirect(new URL("/admin", req.url));
}
