export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBaseUrl } from "@/lib/certificate/generator";
import { getRepository } from "@/lib/db/repository";

const QuerySchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required").max(50),
});

export async function GET(req: NextRequest) {
  try {
    const db = getRepository();
    const { searchParams } = new URL(req.url);
    const regIdParam = searchParams.get("registrationId");

    const validation = QuerySchema.safeParse({ registrationId: regIdParam });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid or missing Registration ID." },
        { status: 400 }
      );
    }

    const regId = validation.data.registrationId;
    const baseUrl = getBaseUrl(req);

    // 1. Query database / mock store
    const participant = await db.getParticipant(regId);

    if (!participant) {
      return NextResponse.json(
        { error: "We couldn't find an eligible participant with this registration ID." },
        { status: 404 }
      );
    }

    // 2. Check existing certificate if already generated
    const existingCertificate = await db.getCertificateByRegistrationId(regId);

    return NextResponse.json({
      success: true,
      participant: {
        registration_id: participant.registration_id,
        name: participant.name,
        department: participant.department,
        college: participant.college,
        event_name: participant.event_name,
        eligible: participant.eligible,
        certificate_generated: participant.certificate_generated,
        certificate_id: participant.certificate_id,
      },
      existingCertificate: existingCertificate
        ? {
            certificate_id: existingCertificate.certificate_id,
            pdf_url: existingCertificate.pdf_url,
            verification_url: `${baseUrl}/verify/${existingCertificate.certificate_id}`,
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error during participant lookup." },
      { status: 500 }
    );
  }
}
