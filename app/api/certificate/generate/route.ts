export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateCertificatePDF, getBaseUrl } from "@/lib/certificate/generator";
import { certificateIdFor, certificateIssueDate } from "@/lib/certificate/signing";
import { UnrenderableNameError } from "@/lib/certificate/text";
import { getRepository } from "@/lib/db/repository";

const GenerateSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required").max(50),
});

/**
 * Issues a participant's certificate.
 *
 * Nothing is written anywhere: the certificate id is derived from the
 * registration id under a server secret, so calling this twice returns the same
 * id and the same PDF. That is the duplicate prevention - there is no second
 * certificate to create.
 */
export async function POST(req: NextRequest) {
  try {
    const db = getRepository();
    const body = await req.json();
    const validation = GenerateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid registration ID parameter." },
        { status: 400 }
      );
    }

    const { registrationId } = validation.data;
    const baseUrl = getBaseUrl(req);

    // Server-side lookup. The name printed always comes from the roster sheet,
    // never from anything the browser sent.
    const participant = await db.getParticipant(registrationId);

    if (!participant) {
      return NextResponse.json(
        { error: "We couldn't find an eligible participant with this registration ID." },
        { status: 404 }
      );
    }

    if (!participant.eligible) {
      return NextResponse.json(
        { error: "A certificate is not currently available for this participant." },
        { status: 403 }
      );
    }

    const existing = await db.getCertificateByRegistrationId(registrationId);
    if (existing && existing.status === "REVOKED") {
      return NextResponse.json(
        { error: "A certificate is not currently available for this participant." },
        { status: 403 }
      );
    }

    const certificateId = certificateIdFor(participant.registration_id);
    const issueDate = certificateIssueDate();

    const pdfBuffer = await generateCertificatePDF({
      participantName: participant.name,
      registrationId: participant.registration_id,
      certificateId,
      issueDate: issueDate.toLocaleDateString("en-GB"),
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      alreadyExists: Boolean(existing),
      certificateId,
      participantName: participant.name,
      registrationId: participant.registration_id,
      issueDate: issueDate.toISOString(),
      verificationUrl: `${baseUrl}/verify/${certificateId}`,
      pdfBase64: pdfBuffer.toString("base64"),
    });
  } catch (error: unknown) {
    if (error instanceof UnrenderableNameError) {
      return NextResponse.json(
        {
          error:
            "This participant's name contains characters our certificate font cannot print. Please contact the ED Cell to have the record corrected.",
        },
        { status: 422 }
      );
    }

    console.error("Certificate Generation Error:", error);
    return NextResponse.json(
      { error: "We couldn't generate your certificate right now. Please try again." },
      { status: 500 }
    );
  }
}
