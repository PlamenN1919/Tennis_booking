import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client that stores the auth session in COOKIES
 * (via @supabase/ssr) instead of localStorage, so server components and
 * server actions can see the logged-in user. Use this (not lib/supabase.ts)
 * for anything auth-related in client components.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
  );
}
