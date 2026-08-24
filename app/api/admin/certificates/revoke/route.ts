export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { parseCertificateId } from "@/lib/certificate/signing";
import { getRepository, refreshRoster } from "@/lib/db/repository";

const RevokeSchema = z.object({
  certificateId: z.string().min(1, "Certificate ID required").max(64),
  status: z.enum(["VALID", "REVOKED"]),
});

/**
 * Reports where a certificate's status actually lives.
 *
 * With the Google Sheet as the only store, revocation is a sheet edit: set the
 * participant's `Revoked` column to TRUE (or `Eligible` to FALSE). This
 * endpoint refreshes the cached roster and reports the resulting status, so an
 * admin can make the edit and confirm it took effect without waiting out the
 * cache.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const db = getRepository();
    const validation = RevokeSchema.safeParse(await req.json());

    if (!validation.success) {
      return NextResponse.json(
        { error: "A certificate ID and a status of VALID or REVOKED are required." },
        { status: 400 }
      );
    }

    const { certificateId, status: requested } = validation.data;
    const parsed = parseCertificateId(certificateId);

    if (!parsed) {
      return NextResponse.json({ error: "That is not a valid certificate ID." }, { status: 400 });
    }

    refreshRoster();
    const certificate = await db.getCertificateById(certificateId);

    if (!certificate) {
      return NextResponse.json(
        { error: "No participant on the roster sheet matches that certificate ID." },
        { status: 404 }
      );
    }

    const applied = certificate.status === requested;

    return NextResponse.json({
      success: applied,
      certificateId: certificate.certificate_id,
      registrationId: certificate.registration_id,
      status: certificate.status,
      message: applied
        ? `Certificate is now ${certificate.status}.`
        : `Certificate is still ${certificate.status}. Set the "Revoked" column to ${
            requested === "REVOKED" ? "TRUE" : "FALSE"
          } for ${certificate.registration_id} in the roster sheet, then try again.`,
    });
  } catch (error) {
    console.error("Certificate status check failed:", error);
    return NextResponse.json({ error: "Failed to check certificate status." }, { status: 500 });
  }
}
