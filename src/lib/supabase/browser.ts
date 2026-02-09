import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : null;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || url === "YOUR_SUPABASE_URL")
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required. Set it in .env.local (see .env.example).");
  if (!key || key === "YOUR_ANON_OR_PUBLISHABLE_KEY")
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Set it in .env.local (see .env.example).");
  return createSupabaseBrowserClient(url, key);
}
