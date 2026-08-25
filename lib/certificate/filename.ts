/**
 * Builds the filename a downloaded certificate is saved under.
 *
 * Names come from a spreadsheet, so they can carry anything a person typed:
 * slashes, quotes, control characters, leading dots. Those either break the
 * download or, in a ZIP, let an entry escape the folder it is extracted into -
 * so the name is reduced to plain word characters before use.
 */
const UNSAFE = /[^A-Za-z0-9]+/g;

export function sanitizeFileNamePart(value: string, fallback = "Certificate"): string {
  const cleaned = value.normalize("NFKD").replace(UNSAFE, "_").replace(/^_+|_+$/g, "");
  // Leave room for the suffix and extension within a 255-byte filename.
  return cleaned.slice(0, 120) || fallback;
}

export function certificateFileName(participantName: string, eventName = "SIH2026"): string {
  const name = sanitizeFileNamePart(participantName, "Participant");
  const event = sanitizeFileNamePart(eventName, "SIH2026");
  return `${name}_${event}_Certificate.pdf`;
}
