export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { generateCertificatePDF, getBaseUrl } from "@/lib/certificate/generator";
import { certificateFileName } from "@/lib/certificate/filename";
import { certificateIdFor, certificateIssueDate } from "@/lib/certificate/signing";
import { UnrenderableNameError } from "@/lib/certificate/text";
import { getRepository } from "@/lib/db/repository";

const QuerySchema = z.object({
  registrationId: z.string().trim().min(1).max(50),
});

/**
 * One certificate as raw PDF bytes.
 *
 * The bulk download builds its ZIP in the browser from these, one request per
 * certificate. Rendering all 289 server-side in a single response would be
 * ~124MB and well over a minute of work - past what a serverless function can
 * return or how long it is allowed to run.
 *
 * Raw bytes rather than the base64 the JSON endpoints return, which would add a
 * third again to every transfer.
 */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const db = getRepository();
    const { searchParams } = new URL(req.url);
    const validation = QuerySchema.safeParse({
      registrationId: searchParams.get("registrationId"),
    });

    if (!validation.success) {
      return NextResponse.json({ error: "A registration ID is required." }, { status: 400 });
    }

    const { registrationId } = validation.data;
    const participant = await db.getParticipant(registrationId);

    if (!participant) {
      return NextResponse.json(
        { error: "No participant on the roster matches that registration ID." },
        { status: 404 }
      );
    }

    const pdf = await generateCertificatePDF({
      participantName: participant.name,
      registrationId: participant.registration_id,
      certificateId: certificateIdFor(participant.registration_id),
      issueDate: certificateIssueDate().toLocaleDateString("en-GB"),
      baseUrl: getBaseUrl(req),
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdf.length),
        "Content-Disposition": `attachment; filename="${certificateFileName(participant.name, participant.event_name)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    if (error instanceof UnrenderableNameError) {
      return NextResponse.json(
        { error: "That participant's name cannot be printed with the certificate font." },
        { status: 422 }
      );
    }

    console.error("Certificate PDF error:", error);
    return NextResponse.json({ error: "Could not render that certificate." }, { status: 500 });
  }
}
