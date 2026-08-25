"use client";

import { certificateFileName } from "@/lib/certificate/filename";

/**
 * Builds a ZIP of every certificate, in the browser.
 *
 * The work is split one request per certificate rather than asking the server
 * for a single archive: 289 certificates is ~124MB and over a minute of PDF
 * rendering, which no serverless function can return or stay alive for. Here
 * each request is one small PDF, and the browser does the assembling.
 *
 * Requests run a few at a time. Fetching them all at once would open hundreds
 * of connections and make the roster sheet's rate limit the bottleneck; one at
 * a time would take minutes.
 */
const CONCURRENCY = 4;

export interface BulkCertificate {
  registration_id: string;
  participant_name: string;
  event_name?: string;
}

export interface BulkProgress {
  completed: number;
  total: number;
  failed: number;
}

export interface BulkResult {
  blob: Blob;
  included: number;
  failed: { registrationId: string; reason: string }[];
}

async function fetchCertificatePdf(registrationId: string): Promise<ArrayBuffer> {
  const res = await fetch(
    `/api/admin/certificates/pdf?registrationId=${encodeURIComponent(registrationId)}`
  );

  if (!res.ok) {
    // The body is JSON on failure and a PDF on success, so only read it here.
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.error || `Request failed (${res.status})`);
  }

  return res.arrayBuffer();
}

export async function buildCertificatesZip(
  certificates: BulkCertificate[],
  onProgress?: (progress: BulkProgress) => void,
  signal?: AbortSignal
): Promise<BulkResult> {
  // Loaded on demand: JSZip is ~100KB that only a bulk download needs.
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  const failed: BulkResult["failed"] = [];
  const usedNames = new Set<string>();
  let completed = 0;
  let cursor = 0;

  const report = () =>
    onProgress?.({ completed, total: certificates.length, failed: failed.length });

  /** Two participants can share a name; a ZIP entry cannot. */
  const uniqueName = (certificate: BulkCertificate): string => {
    const base = certificateFileName(certificate.participant_name, certificate.event_name);
    if (!usedNames.has(base)) {
      usedNames.add(base);
      return base;
    }
    const withId = base.replace(/\.pdf$/, `_${certificate.registration_id}.pdf`);
    usedNames.add(withId);
    return withId;
  };

  const worker = async () => {
    while (cursor < certificates.length) {
      if (signal?.aborted) return;

      const certificate = certificates[cursor++];

      try {
        const bytes = await fetchCertificatePdf(certificate.registration_id);
        zip.file(uniqueName(certificate), bytes);
      } catch (error) {
        // One bad record must not lose the other 288.
        failed.push({
          registrationId: certificate.registration_id,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }

      completed++;
      report();
    }
  };

  report();
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, certificates.length) }, worker));

  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");

  if (failed.length > 0) {
    zip.file(
      "_failed.txt",
      [
        "These certificates could not be generated:",
        "",
        ...failed.map((f) => `${f.registrationId} — ${f.reason}`),
      ].join("\n")
    );
  }

  // STORE, not DEFLATE: a certificate PDF is mostly an already-compressed
  // image, so deflating it costs seconds of CPU per file and saves almost
  // nothing.
  const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });

  return { blob, included: certificates.length - failed.length, failed };
}

/** Hands the finished archive to the browser as a download. */
export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on the next tick so the click has taken the URL.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
