import "server-only";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin-auth";
import { isAllowedAdminEmail } from "@/lib/admin/isAllowedAdminEmail";

/**
 * Requires an authenticated session for /secretgate routes.
 * Local'de (NODE_ENV=development) giriş atlanır; production'da imzalı pk_admin
 * veya whitelist'teki Supabase kullanıcısı gerekli.
 */
export async function requireAdmin(): Promise<User | { isSimpleAuth: true }> {
  if (process.env.NODE_ENV === "development") {
    return { isSimpleAuth: true } as User & { isSimpleAuth: true };
  }
  const valid = await verifyAdminSession();
  if (valid) {
    return { isSimpleAuth: true } as User & { isSimpleAuth: true };
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAllowedAdminEmail(user.email)) {
    redirect("/secretgate/login");
  }
  return user;
}
