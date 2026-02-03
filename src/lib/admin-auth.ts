import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";
const SALT = "plaktakikitap-admin-v1";

function getExpectedToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 4) return null;
  return crypto
    .createHash("sha256")
    .update(password + SALT)
    .digest("hex");
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getExpectedToken();
  if (!token) return false;

  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value === token;
}

export async function setAdminSession(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) return false;

  const token = crypto
    .createHash("sha256")
    .update(password + SALT)
    .digest("hex");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return true;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAdminOrRedirect(): Promise<void> {
  const valid = await verifyAdminSession();
  if (!valid) {
    redirect("/admin/login");
  }
}
