import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const payload = {
    status: String(form.get("status") ?? "reading"),
    book_title: String(form.get("book_title") ?? "—"),
    author: String(form.get("author") ?? ""),
    cover_url: String(form.get("cover_url") ?? ""),
    note: String(form.get("note") ?? ""),
  };

  const supabase = createAdminClient();
  await supabase.from("reading_status").insert(payload);

  return NextResponse.redirect(new URL("/admin", req.url));
}
