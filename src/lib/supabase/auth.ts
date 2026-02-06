import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin-auth";

/**
 * Requires an authenticated session for /admin routes.
 * Local'de (NODE_ENV=development) giriş atlanır; production'da pk_admin, admin_session veya Supabase gerekli.
 */
export async function requireAdmin(): Promise<User | { isSimpleAuth: true }> {
  if (process.env.NODE_ENV === "development") {
    return { isSimpleAuth: true } as User & { isSimpleAuth: true };
  }
  const cookieStore = await cookies();
  if (cookieStore.get("pk_admin")?.value === "1") {
    return { isSimpleAuth: true } as User & { isSimpleAuth: true };
  }
  if (process.env.ADMIN_PASSWORD) {
    const valid = await verifyAdminSession();
    if (valid) return { isSimpleAuth: true } as User & { isSimpleAuth: true };
    redirect("/admin/login");
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return user;
}
