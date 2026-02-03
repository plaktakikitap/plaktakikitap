import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin-auth";

export async function POST() {
  await clearAdminSession();

  // pk_admin cookie (form login)
  const res = NextResponse.json({ success: true });
  res.cookies.set("pk_admin", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
