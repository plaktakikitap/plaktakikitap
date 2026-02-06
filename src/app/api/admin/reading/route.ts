import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const book_title = String(form.get("book_title") ?? "").trim();
  if (!book_title) {
    return NextResponse.redirect(new URL("/admin?err=reading_required", req.url));
  }
  const payload = {
    status: String(form.get("status") ?? "reading"),
    book_title: book_title || "—",
    author: String(form.get("author") ?? "").trim() || null,
    cover_url: String(form.get("cover_url") ?? "").trim() || null,
    note: String(form.get("note") ?? "").trim() || null,
  };

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Veritabanı bağlantısı yapılamadı.";
    return NextResponse.redirect(new URL("/admin?err=reading&msg=" + encodeURIComponent(msg), req.url));
  }
  // Tek satır tut: eski kayıtları sil, yeni ekle
  await supabase.from("reading_status").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await supabase.from("reading_status").insert(payload);

  if (error) {
    return NextResponse.redirect(new URL("/admin?err=reading&msg=" + encodeURIComponent(error.message), req.url));
  }
  return NextResponse.redirect(new URL("/admin?toast=saved", req.url));
}
