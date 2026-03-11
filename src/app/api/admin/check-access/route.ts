import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const getAdminAllowedEmails = (): string[] =>
  (process.env.ADMIN_ALLOWED_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/** Supabase ile giriş yapan kullanıcının admin izinli e-posta listesinde olup olmadığını kontrol eder. */
export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  let user = (await supabase.auth.getUser()).data.user;
  if (!user && token) {
    const { data: { user: userFromToken } } = await supabase.auth.getUser(token);
    user = userFromToken ?? undefined;
  }

  const allowed = getAdminAllowedEmails();
  const ok = !!user?.email && allowed.includes(user.email.toLowerCase());
  return NextResponse.json({ ok, email: ok ? user!.email : undefined });
}
