import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthConfigured, isAuthenticatedAdmin } from "./auth";

/**
 * Returns an error response when the request is not an authenticated admin,
 * or `null` when the request may proceed.
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin access is not configured on this server (ADMIN_SECRET_KEY is unset)." },
      { status: 503 }
    );
  }

  if (!(await isAuthenticatedAdmin(req))) {
    return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  }

  return null;
}
