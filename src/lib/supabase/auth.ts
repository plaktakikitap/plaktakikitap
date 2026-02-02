import "server-only";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Requires an authenticated session for /admin routes.
 * Redirects to /admin/login if not logged in.
 * Use in admin layout or page.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}
