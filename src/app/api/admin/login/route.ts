import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import { ADMIN_COOKIE_NAME } from "@/lib/admin/adminCookieAuth";
import {
  adminCookieSetOptions,
  createSignedAdminCookieValue,
} from "@/lib/admin/signedAdminCookie";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type AttemptBucket = { count: number; resetAt: number };
const loginAttempts = new Map<string, AttemptBucket>();

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function consumeLoginAttempt(
  ip: string
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  if (loginAttempts.size > 4000) {
    for (const [key, bucket] of loginAttempts) {
      if (now >= bucket.resetAt) loginAttempts.delete(key);
    }
  }
  const current = loginAttempts.get(ip);
  if (!current || now >= current.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (current.count >= MAX_ATTEMPTS) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return { ok: true };
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = consumeLoginAttempt(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Çok fazla deneme. 15 dakika sonra tekrar deneyin." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    );
  }

  const form = await req.formData();
  const password = String(form.get("password") ?? "").trim();
  if (!password) {
    return NextResponse.redirect(new URL("/secretgate/login?err=1", req.url));
  }

  let ok = false;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .limit(1)
      .order("updated_at", { ascending: false })
      .maybeSingle();
    const value = (data?.value as { admin_password_hash?: string } | null) ?? {};
    if (value.admin_password_hash) {
      ok = await bcrypt.compare(password, value.admin_password_hash);
    } else {
      ok = password === process.env.ADMIN_PASSWORD;
    }
  } catch {
    ok = password === process.env.ADMIN_PASSWORD;
  }

  if (!ok) {
    return NextResponse.redirect(new URL("/secretgate/login?err=1", req.url));
  }

  const signed = await createSignedAdminCookieValue();
  if (!signed) {
    return NextResponse.json(
      { error: "ADMIN_COOKIE_SECRET tanımlı değil." },
      { status: 500 }
    );
  }

  const res = NextResponse.redirect(new URL("/secretgate", req.url));
  res.cookies.set(ADMIN_COOKIE_NAME, signed, adminCookieSetOptions());
  return res;
}
