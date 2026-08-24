export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { generateCertificatePDF, getBaseUrl } from "@/lib/certificate/generator";
import { certificateIdFor, certificateIssueDate } from "@/lib/certificate/signing";
import { UnrenderableNameError } from "@/lib/certificate/text";
import { getRepository, refreshRoster } from "@/lib/db/repository";

const DEFAULT_EVENT = "Smart India Hackathon 2026";

const AdminGenerateSchema = z.object({
  registrationId: z.string().trim().min(1, "Registration ID is required").max(50),
  /** Prints this instead of the name on the roster. Required if they are not on it. */
  participantName: z.string().trim().min(1).max(120).optional(),
  eventName: z.string().trim().min(1).max(160).optional(),
});

/**
 * Admin certificate issuing, for participants the public route turns away.
 *
 * `/api/certificate/generate` only serves someone who is on the roster sheet and
 * eligible, and always prints the name held there. An admin may additionally:
 *   - issue for a registration ID absent from the sheet, supplying the name,
 *   - issue for someone the sheet marks ineligible or revoked,
 *   - print a corrected name when the sheet's spelling is wrong.
 *
 * One thing an admin cannot do is make an off-roster certificate verifiable.
 * `/verify` confirms the holder against the sheet, so a certificate issued for a
 * registration ID that is not on it will fail public verification. The response
 * says so via `verifiable` rather than letting an organiser hand out a
 * certificate whose QR code leads to "Certificate Not Found".
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const db = getRepository();
    const validation = AdminGenerateSchema.safeParse(await req.json());

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid request." },
        { status: 400 }
      );
    }

    const { registrationId, participantName, eventName } = validation.data;

    // An admin is usually here because the sheet was just edited, so read past
    // the cache rather than answering from rows up to a minute old.
    refreshRoster();
    const participant = await db.getParticipant(registrationId);
    const name = participantName || participant?.name;

    if (!name) {
      return NextResponse.json(
        {
          error:
            "This registration ID is not on the roster sheet. Enter the participant's name to issue a certificate for it anyway.",
          needsName: true,
        },
        { status: 400 }
      );
    }

    const event = eventName || participant?.event_name || DEFAULT_EVENT;
    const baseUrl = getBaseUrl(req);
    const existing = await db.getCertificateByRegistrationId(registrationId);

    // The id is derived from the registration id, so re-issuing always lands on
    // the same public certificate id and existing QR codes keep resolving.
    const certificateId = certificateIdFor(registrationId);
    const issueDate = existing?.issue_date ?? certificateIssueDate().toISOString();

    const pdfBuffer = await generateCertificatePDF({
      participantName: name,
      registrationId,
      certificateId,
      issueDate: new Date(issueDate).toLocaleDateString("en-GB"),
      baseUrl,
    });

    const onRoster = Boolean(participant);
    const nameDiffersFromRoster = Boolean(
      participant && participantName && participantName !== participant.name
    );

    return NextResponse.json({
      success: true,
      certificateId,
      participantName: name,
      registrationId,
      eventName: event,
      issueDate,
      status: existing?.status ?? "VALID",
      verificationUrl: `${baseUrl}/verify/${certificateId}`,
      pdfBase64: pdfBuffer.toString("base64"),
      onRoster,
      rosterName: participant?.name ?? null,
      alreadyExists: Boolean(existing),
      // Public verification checks the sheet, so an off-roster certificate
      // cannot verify and a revoked one verifies as REVOKED.
      verifiable: onRoster && existing?.status !== "REVOKED",
      warning: !onRoster
        ? `${registrationId} is not on the roster sheet, so this certificate will fail public verification. Add a row for them, then re-read the sheet.`
        : existing?.status === "REVOKED"
          ? `The roster sheet marks ${registrationId} as revoked, so this certificate verifies as REVOKED. Clear the Revoked column to restore it.`
          : nameDiffersFromRoster
            ? `Printed as "${name}", but the sheet says "${participant?.name}" — the verification page will show the sheet's spelling. Correct the sheet row to make them agree.`
            : null,
    });
  } catch (error: unknown) {
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
