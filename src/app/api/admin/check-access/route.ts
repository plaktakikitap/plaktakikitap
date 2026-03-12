import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  isAllowedAdminEmail,
  getNormalizedAllowedEmails,
  normalizeUserEmail,
} from "@/lib/admin/isAllowedAdminEmail";

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

  const ok = isAllowedAdminEmail(user?.email);

  const body: Record<string, unknown> = {
    ok,
    email: ok ? user!.email : undefined,
  };

  if (process.env.NODE_ENV !== "production") {
    body.allowedRaw = process.env.ADMIN_ALLOWED_EMAIL ?? "";
    body.allowedNormalized = getNormalizedAllowedEmails();
    body.userEmailRaw = user?.email ?? null;
    body.userEmailNormalized = normalizeUserEmail(user?.email) || null;
    body.isAllowed = ok;
  }

  return NextResponse.json(body);
}
