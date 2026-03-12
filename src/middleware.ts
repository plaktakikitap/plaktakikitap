import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isAllowedAdminEmail } from "@/lib/admin/isAllowedAdminEmail";

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
    const isSupabaseAdmin = isAllowedAdminEmail(user?.email);
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
