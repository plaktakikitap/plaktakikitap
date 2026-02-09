import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service role client (bypasses RLS). Server-only. Never import in client components.
 * Throws if NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are missing.
 */
export function createAdminClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const url =
    rawUrl && rawUrl.startsWith("http") && rawUrl !== "YOUR_SUPABASE_URL"
      ? rawUrl
      : null;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url)
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is required and must start with http:// or https://. Set it in .env.local (see .env.example)."
    );
  if (!key || key === "YOUR_SERVICE_ROLE_KEY")
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required. Set it in .env.local (see .env.example).");
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
