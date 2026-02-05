import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const getSupabaseEnv = () => {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http") &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "YOUR_SUPABASE_URL"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : "https://placeholder.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDYxOTE2MDB9.placeholder";
  return { url, key };
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const { url, key } = getSupabaseEnv();
  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return { response, user } as { response: NextResponse; user: import("@supabase/supabase-js").User | null };
}
