import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isAdminFromCookies } from "@/lib/admin/adminCookieAuth";

const PUBLIC_ADMIN_API = new Set([
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/check-access",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  // Admin API: session yoksa 401 JSON (login/logout/check-access hariç)
  if (pathname.startsWith("/api/admin")) {
    if (PUBLIC_ADMIN_API.has(pathname)) {
      return response;
    }
    if (!(await isAdminFromCookies(request, user?.email))) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }
    return response;
  }

  // Planner yazma / upload uçları
  if (
    pathname.startsWith("/api/planner/upload") ||
    pathname.startsWith("/api/planner/admin") ||
    pathname === "/api/planner/entry" ||
    pathname.startsWith("/api/planner/entry/") ||
    pathname.startsWith("/api/planner/media/") ||
    pathname === "/api/planner/recent" ||
    pathname === "/api/beslenme-analiz"
  ) {
    // GET okuma için bazı planner uçları public kalabilir; yazma metodlarında koru
    const method = request.method.toUpperCase();
    const isWrite =
      method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
    const alwaysProtect =
      pathname.includes("/upload") ||
      pathname.startsWith("/api/planner/admin") ||
      pathname === "/api/beslenme-analiz" ||
      pathname === "/api/planner/recent";

    if (alwaysProtect || isWrite) {
      if (!(await isAdminFromCookies(request, user?.email))) {
        return NextResponse.json(
          { error: "Yetkisiz erişim" },
          { status: 401 }
        );
      }
    }
    return response;
  }

  // Secretgate UI
  if (pathname.startsWith("/secretgate")) {
    if (pathname === "/secretgate/login") {
      return response;
    }
    if (process.env.NODE_ENV === "development") {
      return response;
    }
    if (await isAdminFromCookies(request, user?.email)) {
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
    "/secretgate/:path*",
    "/api/admin/:path*",
    "/api/planner/:path*",
    "/api/beslenme-analiz",
  ],
};
