export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { Certificate, Participant } from "@/lib/db/mock-store";
import { generateCertificatePDF, getBaseUrl } from "@/lib/certificate/generator";
import { certificateIdFor, certificateIssueDate } from "@/lib/certificate/signing";
import { UnrenderableNameError } from "@/lib/certificate/text";
import { getRepository } from "@/lib/db/repository";

const DEFAULT_EVENT = "Smart India Hackathon 2026";

const AdminGenerateSchema = z.object({
  registrationId: z.string().trim().min(1, "Registration ID is required").max(50),
  // Required only when the registration ID is not already in the database.
  participantName: z.string().trim().min(1).max(120).optional(),
  eventName: z.string().trim().min(1).max(160).optional(),
});

/**
 * Admin certificate issuing.
 *
 * Unlike the public route (`/api/certificate/generate`), which will only issue a
 * certificate to a known, eligible participant and always prints the name held
 * on file, an admin may:
 *   - issue for a registration ID that is not in the database (supplying a name),
 *   - issue for a participant flagged ineligible,
 *   - correct the printed name on an already-issued certificate.
 *
 * The public route keeps its restrictions; this endpoint is gated by requireAdmin.
 */
export async function POST(req: NextRequest) {
  try {
    const db = getRepository();
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const validation = AdminGenerateSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid request." },
        { status: 400 }
      );
    }

    const { registrationId, participantName, eventName } = validation.data;
    const participant = await db.getParticipant(registrationId);
    const name = participantName || participant?.name;

    if (!name) {
      return NextResponse.json(
        {
          error:
            "This registration ID is not in the database. Enter the participant's name to issue a certificate for it anyway.",
          needsName: true,
        },
        { status: 400 }
      );
    }

    const event = eventName || participant?.event_name || DEFAULT_EVENT;
    const now = new Date().toISOString();
    const baseUrl = getBaseUrl(req);

    // Keep the roster in step with what the admin just issued.
    let participantCreated = false;
    if (!participant) {
      const created: Participant = {
        id: `p-${registrationId}`,
        registration_id: registrationId,
        name,
        department: "",
        college: "",
        event_name: event,
        eligible: true,
        certificate_generated: false,
        created_at: now,
        updated_at: now,
      };
      await db.upsertParticipant(created);
      participantCreated = true;
    } else if (participantName && participantName !== participant.name) {
      await db.upsertParticipant({ ...participant, name, event_name: event, updated_at: now });
    }

    const existingCert = await db.getCertificateByRegistrationId(registrationId);

    // The id is derived from the registration id, so re-issuing always lands on
    // the same public certificate id and existing QR codes keep resolving.
    const certificateId = certificateIdFor(registrationId);
    const issueDate = existingCert?.issue_date ?? certificateIssueDate().toISOString();

    const pdfBuffer = await generateCertificatePDF({
      participantName: name,
      registrationId,
      certificateId,
      issueDate: new Date(issueDate).toLocaleDateString("en-GB"),
      baseUrl,
    });

    const record: Certificate = {
      id: existingCert?.id ?? `cert-${Date.now()}`,
      certificate_id: certificateId,
      participant_id: (await db.getParticipant(registrationId))?.id,
      participant_name: name,
      registration_id: registrationId,
      event_name: event,
      issue_date: issueDate,
      // Re-issuing does not silently un-revoke a certificate.
      status: existingCert?.status ?? "VALID",
      created_at: existingCert?.created_at ?? now,
    };

    await db.saveCertificate(record);

    return NextResponse.json({
      success: true,
      alreadyExists: Boolean(existingCert),
      participantCreated,
      certificateId,
      participantName: name,
      registrationId,
      eventName: event,
      status: record.status,
      verificationUrl: `${baseUrl}/verify/${certificateId}`,
      pdfBase64: pdfBuffer.toString("base64"),
    });
  } catch (error: any) {
    if (error instanceof UnrenderableNameError) {
      return NextResponse.json(
        {
          error: `That name cannot be printed with the certificate font (${error.unsupported.join(" ")}). Please enter it in Latin characters.`,
        },
        { status: 422 }
      );
    }

    console.error("Admin Certificate Generation Error:", error);
    return NextResponse.json({ error: "Could not generate the certificate." }, { status: 500 });
  }
}
