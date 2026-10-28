import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // 1. Static and system assets: pass through immediately
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/v1") ||
    pathname.startsWith("/images") ||
    pathname.includes(".") // favicon.ico, etc.
  ) {
    return response;
  }

  // 1b. Check for instant demo session cookie
  const isDemoSession = request.cookies.get("floodlens_demo_session")?.value;
  if (isDemoSession) {
    if (pathname === "/auth" && !request.nextUrl.searchParams.get("next")) {
      return NextResponse.redirect(new URL("/investigations/new", request.url));
    }
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase environment is not configured, permit navigation so client-side setup guides render
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !supabaseUrl.startsWith("http") ||
    supabaseUrl.includes("placeholder")
  ) {
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 2. Define protected application route patterns
    const isProtectedRoute =
      pathname.startsWith("/investigations") ||
      pathname.startsWith("/hub") ||
      pathname.startsWith("/simulator") ||
      pathname.startsWith("/infrastructure") ||
      pathname.startsWith("/flowchart") ||
      pathname.startsWith("/onboarding");

    // 3. If unauthenticated user accesses protected route: redirect to /auth?next=...
    if (!user && isProtectedRoute) {
      const redirectUrl = new URL("/auth", request.url);
      const fullTarget = request.nextUrl.pathname + request.nextUrl.search;
      redirectUrl.searchParams.set("next", fullTarget);
      return NextResponse.redirect(redirectUrl);
    }

    // 4. If already authenticated user visits /auth without a specific redirect, send to /hub
    if (user && pathname === "/auth" && !request.nextUrl.searchParams.get("next")) {
      return NextResponse.redirect(new URL("/investigations/new", request.url));
    }

    return response;
  } catch (err) {
    console.warn("[Middleware] Error processing session:", err);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
