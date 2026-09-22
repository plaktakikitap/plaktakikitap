import type { NextRequest } from "next/server";
import { isAllowedAdminEmail } from "@/lib/admin/isAllowedAdminEmail";
import { verifySignedAdminCookieValue } from "@/lib/admin/signedAdminCookie";

/** Proje genelinde tek admin cookie adı (login ile aynı). */
export const ADMIN_COOKIE_NAME = "pk_admin";

/** Middleware-safe cookie/email check (no server-only imports). */
export async function isAdminFromCookies(
  req: NextRequest,
  userEmail?: string | null
): Promise<boolean> {
  if (process.env.NODE_ENV === "development") return true;
  if (await verifySignedAdminCookieValue(req.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return true;
  }
  if (isAllowedAdminEmail(userEmail)) return true;
  return false;
}
