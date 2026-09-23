import "server-only";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { isAllowedAdminEmail } from "@/lib/admin/isAllowedAdminEmail";
import {
  ADMIN_COOKIE_NAME,
  isAdminFromCookies,
} from "@/lib/admin/adminCookieAuth";

/**
 * Admin API yetki kontrolü.
 * development: açık; production: pk_admin cookie veya whitelist e-posta.
 */
export async function isAdminApiAuthorized(
  req?: NextRequest
): Promise<boolean> {
  if (process.env.NODE_ENV === "development") return true;

  let email: string | null = null;
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  } catch {
    /* ignore */
  }

  if (req) return isAdminFromCookies(req, email);

  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_COOKIE_NAME)?.value === "1") return true;
  return isAllowedAdminEmail(email);
}

/** Yetkisizse 401 Response; yetkiliyse null. */
export async function requireAdminApi(
  req?: NextRequest
): Promise<NextResponse | null> {
  if (await isAdminApiAuthorized(req)) return null;
  return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
}

export { isAdminFromCookies, ADMIN_COOKIE_NAME } from "@/lib/admin/adminCookieAuth";
