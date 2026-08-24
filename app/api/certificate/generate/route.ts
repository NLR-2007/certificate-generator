import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { Certificate } from "@/lib/db/mock-store";
import { generateCertificatePDF, generateCertificateId, getBaseUrl } from "@/lib/certificate/generator";
import { UnrenderableNameError } from "@/lib/certificate/text";
import { getRepository } from "@/lib/db/repository";

const GenerateSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required").max(50),
});

export async function POST(req: NextRequest) {
  const db = getRepository();
  try {
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

    // 1. Server-side Query Participant Details (Never trust client-supplied names!)
    const participant = await db.getParticipant(registrationId);

    if (!participant) {
      return NextResponse.json(
        { error: "We couldn't find an eligible participant with this registration ID." },
        { status: 404 }
      );
    }

    // 2. Check Eligibility
    if (!participant.eligible) {
      return NextResponse.json(
        { error: "A certificate is not currently available for this participant." },
        { status: 403 }
      );
    }

    // 3. Duplicate Prevention Check
    const existingCert = await db.getCertificateByRegistrationId(registrationId);
    if (existingCert) {
      // Re-generate current PDF for preview/download
      const pdfBuffer = await generateCertificatePDF({
        participantName: participant.name,
        registrationId: participant.registration_id,
        certificateId: existingCert.certificate_id,
        issueDate: new Date(existingCert.issue_date).toLocaleDateString("en-GB"),
        baseUrl,
      });

      return NextResponse.json({
        success: true,
        alreadyExists: true,
        message: "Your certificate has already been generated.",
        certificateId: existingCert.certificate_id,
        participantName: participant.name,
        registrationId: participant.registration_id,
        verificationUrl: `${baseUrl}/verify/${existingCert.certificate_id}`,
        pdfBase64: pdfBuffer.toString("base64"),
      });
    }

    // 4. Generate Unique Certificate ID & Cryptographic Verification Token
    let certificateId = generateCertificateId("SIH26");
    for (let attempt = 0; attempt < 5 && await db.getCertificateById(certificateId); attempt++) {
      certificateId = generateCertificateId("SIH26");
    }
    const verificationToken = `vt_${randomBytes(24).toString("hex")}`;
    const issueDateStr = new Date().toISOString();

    // 5. Generate Serverless PDF Certificate using pdf-lib
    const pdfBuffer = await generateCertificatePDF({
      participantName: participant.name,
      registrationId: participant.registration_id,
      certificateId,
      issueDate: new Date().toLocaleDateString("en-GB"),
      baseUrl,
    });

    // 6. Save Record in Database
    const newCertRecord: Certificate = {
      id: `cert-${Date.now()}`,
      certificate_id: certificateId,
      participant_id: participant.id,
      participant_name: participant.name,
      registration_id: participant.registration_id,
      event_name: participant.event_name,
      issue_date: issueDateStr,
      verification_token: verificationToken,
      status: "VALID",
      created_at: issueDateStr,
    };

    await db.saveCertificate(newCertRecord);

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      certificateId,
      participantName: participant.name,
      registrationId: participant.registration_id,
      verificationUrl: `${baseUrl}/verify/${certificateId}`,
      pdfBase64: pdfBuffer.toString("base64"),
    });
  } catch (error: any) {
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
