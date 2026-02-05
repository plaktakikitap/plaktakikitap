import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const getAdminAllowedEmails = (): string[] =>
  (process.env.ADMIN_ALLOWED_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/** Supabase ile giriş yapan kullanıcının admin izinli e-posta listesinde olup olmadığını kontrol eder. */
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const allowed = getAdminAllowedEmails();
  const ok =
    !!user?.email && allowed.includes(user.email.toLowerCase());
  return NextResponse.json({ ok, email: ok ? user!.email : undefined });
}
