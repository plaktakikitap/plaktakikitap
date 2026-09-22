/** Edge-safe HMAC cookie helpers (middleware + server). */

export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const COOKIE_PAYLOAD = "1";

function getCookieSecret(): string | null {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret || secret === "replace-with-long-random-secret") return null;
  return secret;
}

function bytesToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function timingSafeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}

async function hmacSha256Base64Url(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return bytesToBase64Url(sig);
}

export async function createSignedAdminCookieValue(): Promise<string | null> {
  const secret = getCookieSecret();
  if (!secret) return null;
  const sig = await hmacSha256Base64Url(secret, COOKIE_PAYLOAD);
  return `${COOKIE_PAYLOAD}.${sig}`;
}

export async function verifySignedAdminCookieValue(
  value?: string | null
): Promise<boolean> {
  const secret = getCookieSecret();
  if (!secret || !value) return false;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (payload !== COOKIE_PAYLOAD || !sig) return false;
  const expected = await hmacSha256Base64Url(secret, payload);
  return timingSafeEqual(sig, expected);
}

export function adminCookieSetOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  };
}
