import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "").trim();
  if (!password) {
    return NextResponse.redirect(new URL("/admin/login?err=1", req.url));
  }

  let ok = false;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .limit(1)
      .order("updated_at", { ascending: false })
      .maybeSingle();
    const value = (data?.value as { admin_password_hash?: string } | null) ?? {};
    if (value.admin_password_hash) {
      ok = await bcrypt.compare(password, value.admin_password_hash);
    } else {
      ok = password === process.env.ADMIN_PASSWORD;
    }
  } catch {
    ok = password === process.env.ADMIN_PASSWORD;
  }

  if (!ok) {
    return NextResponse.redirect(new URL("/admin/login?err=1", req.url));
  }

  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set("pk_admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
