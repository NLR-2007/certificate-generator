export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthConfigured, isAuthenticatedAdmin } from "@/lib/admin/auth";
import { getRepository } from "@/lib/db/repository";

export async function GET(req: NextRequest) {
  try {
    const authenticated = await isAuthenticatedAdmin(req);

    return NextResponse.json({
      configured: isAdminAuthConfigured(),
      authenticated,
      backend: getRepository().backend,
    });
  } catch (error) {
    console.error("Admin session lookup failed:", error);
    return NextResponse.json(
      { configured: false, authenticated: false, backend: "sheet" },
      { status: 200 }
    );
  }
}
