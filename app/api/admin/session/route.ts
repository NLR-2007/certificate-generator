import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthConfigured, isAuthenticatedAdmin } from "@/lib/admin/auth";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    configured: isAdminAuthConfigured(),
    authenticated: await isAuthenticatedAdmin(req),
  });
}
