export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  isAdminAuthConfigured,
  isValidAdminPassphrase,
} from "@/lib/admin/auth";

const LoginSchema = z.object({
  passphrase: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  try {
    if (!isAdminAuthConfigured()) {
      return NextResponse.json(
        { error: "Admin access is not configured on this server (ADMIN_SECRET_KEY is unset)." },
        { status: 503 }
      );
    }

    const validation = LoginSchema.safeParse(await req.json());
    if (!validation.success || !isValidAdminPassphrase(validation.data.passphrase)) {
      return NextResponse.json(
        { error: "Invalid passphrase. Please check your admin password." },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    if (!token) {
      return NextResponse.json({ error: "Could not start an admin session." }, { status: 500 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
