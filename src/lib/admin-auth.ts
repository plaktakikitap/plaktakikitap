import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** Proje genelinde tek admin cookie adı (login ile aynı). */
export const ADMIN_COOKIE_NAME = "pk_admin";
const ADMIN_COOKIE_VALUE = "1";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_COOKIE_VALUE;
}

export async function setAdminSession(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) return false;

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  return true;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  // Eski admin_session cookie'sini de temizle
  cookieStore.delete("admin_session");
}

export async function requireAdminOrRedirect(): Promise<void> {
  const valid = await verifyAdminSession();
  if (!valid) {
    redirect("/secretgate/login");
  }
}
