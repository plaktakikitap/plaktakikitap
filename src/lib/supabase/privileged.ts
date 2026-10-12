import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

function serviceRoleReady() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(key && key !== "YOUR_SERVICE_ROLE_KEY");
}

/**
 * Admin okuma/yazma. Service role tanımlıysa onu kullanır.
 * Yerelde yoksa giriş yapmış yöneticinin oturumunu kullanır; RLS ona göre işler.
 */
export async function createPrivilegedClient() {
  if (serviceRoleReady()) return createAdminClient();
  return createServerClient();
}
