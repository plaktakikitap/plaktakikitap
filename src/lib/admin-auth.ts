import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME } from "@/lib/admin/adminCookieAuth";
import {
  adminCookieSetOptions,
  createSignedAdminCookieValue,
  verifySignedAdminCookieValue,
} from "@/lib/admin/signedAdminCookie";

export { ADMIN_COOKIE_NAME };

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySignedAdminCookieValue(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  );
}

export async function setAdminSession(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) return false;

  const signed = await createSignedAdminCookieValue();
  if (!signed) return false;

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, signed, adminCookieSetOptions());
  return true;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  cookieStore.delete("admin_session");
}

export async function requireAdminOrRedirect(): Promise<void> {
  const valid = await verifyAdminSession();
  if (!valid) {
    redirect("/secretgate/login");
  }
}
