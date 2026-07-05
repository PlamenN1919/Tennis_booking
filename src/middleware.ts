import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session for /admin requests so that server
 * components and server actions always see a valid (non-expired) session.
 * Server components cannot write cookies, so without this an admin returning
 * with an expired access token would be bounced to the login screen even
 * though their refresh token is still valid.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (
    !url ||
    !anonKey ||
    url === "https://your-project.supabase.co" ||
    url === "https://placeholder.supabase.co"
  ) {
    // Local mock mode — nothing to refresh
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    // Triggers a token refresh if the access token has expired
    await supabase.auth.getUser();
  } catch {
    // Supabase unreachable — let the page render (it will show the login)
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
