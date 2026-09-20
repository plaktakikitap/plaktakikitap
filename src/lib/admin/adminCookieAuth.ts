import type { NextRequest } from "next/server";
import { isAllowedAdminEmail } from "@/lib/admin/isAllowedAdminEmail";

/** Proje genelinde tek admin cookie adı (login ile aynı). */
export const ADMIN_COOKIE_NAME = "pk_admin";
const ADMIN_COOKIE_VALUE = "1";

/** Middleware-safe cookie/email check (no server-only imports). */
export function isAdminFromCookies(
  req: NextRequest,
  userEmail?: string | null
): boolean {
  if (process.env.NODE_ENV === "development") return true;
  if (req.cookies.get(ADMIN_COOKIE_NAME)?.value === ADMIN_COOKIE_VALUE) {
    return true;
  }
  if (isAllowedAdminEmail(userEmail)) return true;
  return false;
}
