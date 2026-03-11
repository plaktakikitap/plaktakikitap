import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const getAdminAllowedEmails = (): string[] =>
  (process.env.ADMIN_ALLOWED_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().replace(/^["']|["']$/g, "").toLowerCase())
    .filter(Boolean);

/** Supabase ile giriş yapan kullanıcının admin izinli e-posta listesinde olup olmadığını kontrol eder. */
export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  let user = (await supabase.auth.getUser()).data.user;
  if (!user && token) {
    const { data: { user: userFromToken } } = await supabase.auth.getUser(token);
    user = userFromToken ?? null;
  }

  const allowed = getAdminAllowedEmails();
  const userEmail = user?.email?.trim().toLowerCase();
  const ok = !!userEmail && allowed.length > 0 && allowed.includes(userEmail);
  if (!ok && process.env.NODE_ENV !== "production") {
    console.log("ADMIN_CHECK: ADMIN_ALLOWED_EMAIL (raw):", process.env.ADMIN_ALLOWED_EMAIL);
    console.log("ADMIN_CHECK: allowed list:", allowed);
    console.log("ADMIN_CHECK: logged user email:", user?.email);
    console.log("ADMIN_CHECK: normalized user email:", userEmail);
  }
  return NextResponse.json({ ok, email: ok ? user!.email : undefined });
}
