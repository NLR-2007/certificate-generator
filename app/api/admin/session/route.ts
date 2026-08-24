import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthConfigured, isAuthenticatedAdmin } from "@/lib/admin/auth";
import { createAdminCustomToken } from "@/lib/firebase/admin";
import { getRepository } from "@/lib/db/repository";

export async function GET(req: NextRequest) {
  const authenticated = await isAuthenticatedAdmin(req);
  const backend = getRepository().backend;

  // Only an authenticated admin gets a Firebase token. It carries an `admin`
  // claim that the security rules check before allowing realtime listeners.
  const firebaseToken = authenticated ? await createAdminCustomToken() : null;

  return NextResponse.json({
    configured: isAdminAuthConfigured(),
    authenticated,
    backend,
    realtime: Boolean(firebaseToken),
    firebaseToken,
  });
}
