import { createServerClient } from "@/lib/supabase/server";

/**
 * Supabase server client (anon key, respects RLS).
 * Use in Server Components for public reads.
 */
export async function supabaseServer() {
  return createServerClient();
}
