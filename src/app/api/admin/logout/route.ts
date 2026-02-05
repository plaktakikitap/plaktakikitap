import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  await clearAdminSession();

  const supabase = await createServerClient();
  await supabase.auth.signOut();

  const res = NextResponse.json({ success: true });
  res.cookies.set("pk_admin", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
