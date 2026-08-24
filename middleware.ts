import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/admin/auth";

/**
 * Gates the admin dashboard at the edge so an unauthenticated visitor is
 * redirected before any admin UI is served. The API routes still enforce
 * authentication independently - this is a redirect, not the security boundary.
 */
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (await verifySessionToken(token)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Everything under /admin except the login page itself.
  matcher: ["/admin", "/admin/((?!login).*)"],
};
