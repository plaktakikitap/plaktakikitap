import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const getAdminAllowedEmails = (): string[] =>
  (process.env.ADMIN_ALLOWED_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().replace(/^["']|["']$/g, "").toLowerCase())
    .filter(Boolean);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { response, user } = await updateSession(request);

  // Secretgate (admin): local'de (development) giriş atlanır; production'da pk_admin veya Supabase gerekli
  if (pathname.startsWith("/secretgate")) {
    if (pathname === "/secretgate/login") {
      return response;
    }
    if (process.env.NODE_ENV === "development") {
      return response;
    }
    const isCookieAuth = request.cookies.get("pk_admin")?.value === "1";
    const allowedEmails = getAdminAllowedEmails();
    const userEmail = user?.email?.trim().toLowerCase();
    const isSupabaseAdmin =
      !!userEmail && allowedEmails.length > 0 && allowedEmails.includes(userEmail);
    if (isCookieAuth || isSupabaseAdmin) {
      return response;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/secretgate/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
