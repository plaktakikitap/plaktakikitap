import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http") &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "YOUR_SUPABASE_URL"
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : "https://placeholder.supabase.co";

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Service role client (bypasses RLS).
 * Server-only. Never import in client components.
 * When URL/key are not configured, uses placeholder URL so the app does not crash; queries will fail and callers should handle errors.
 */
export function createAdminClient() {
  if (!supabaseServiceRoleKey || supabaseServiceRoleKey === "YOUR_SERVICE_ROLE_KEY") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for createAdminClient(). Set it in .env.local (see .env.example)."
    );
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}
