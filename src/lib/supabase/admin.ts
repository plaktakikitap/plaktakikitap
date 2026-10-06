import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client. Uses the service role when it is set (bypasses RLS).
 * Falls back to the anon key so public pages still load when only that key is configured.
 * Never import in client components.
 */
export function createAdminClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const url =
    rawUrl && rawUrl.startsWith("http") && rawUrl !== "YOUR_SUPABASE_URL"
      ? rawUrl
      : null;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key =
    serviceKey && serviceKey !== "YOUR_SERVICE_ROLE_KEY"
      ? serviceKey
      : anonKey && anonKey !== "YOUR_SUPABASE_ANON_KEY"
        ? anonKey
        : null;
  if (!url)
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is required and must start with http:// or https://. Set it in .env.local (see .env.example)."
    );
  if (!key)
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required. Set it in .env.local (see .env.example).");
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
