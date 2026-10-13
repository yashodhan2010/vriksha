import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { auditStrategyPath, isAuditModeActive } from "@/lib/audit-mode";

// Legacy disclosure URLs are allowed through only long enough to redirect to
// their respective section on the consolidated Compliance page.
const auditPublicPaths = new Set([
  "/",
  auditStrategyPath,
  "/compliance",
  "/investor-charter",
  "/complaints",
  "/audit-report"
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep the restriction at the edge so bookmarked or manually entered URLs
  // cannot expose pages that have been removed from the navigation.
  if (
    isAuditModeActive() &&
    (request.method === "GET" || request.method === "HEAD") &&
    !pathname.startsWith("/api/") &&
    !auditPublicPaths.has(pathname)
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
