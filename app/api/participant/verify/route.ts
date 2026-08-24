import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockDb } from "@/lib/db/mock-store";

const QuerySchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required").max(50),
});

export async function GET(req: NextRequest) {
  try {
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

    // 1. Query database / mock store
    const participant = mockDb.findParticipantByRegId(regId);

    if (!participant) {
      return NextResponse.json(
        { error: "We couldn't find an eligible participant with this registration ID." },
        { status: 404 }
      );
    }

    // 2. Check existing certificate if already generated
    const existingCertificate = mockDb.findCertificateByRegId(regId);

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
            verification_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/verify/${existingCertificate.certificate_id}`,
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
