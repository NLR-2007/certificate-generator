/**
 * Pulls team members out of a single free-text cell.
 *
 * The registration form writes every team member into one column
 * ("All Team Member Names & IDs") rather than numbered columns, and students
 * type it however they like:
 *
 *     Marri Hruthika - 2520090002, K Gayathri - 2520080010
 *     Marri Hruthika (2520090002)
 *     2520090002 Marri Hruthika
 *     Marri Hruthika, 2520090002, K Gayathri, 2520080010
 *
 * All of those describe the same thing, and each member needs their own
 * verifiable certificate, so the cell is parsed rather than ignored.
 */
export interface ParsedMember {
  name: string;
  registrationId: string;
}

/** A roll number: a run of at least six digits. */
const ID_PATTERN = /\d{6,}/;

/** Entry separators, and the punctuation that decorates a name/id pair. */
const ENTRY_SEPARATORS = /[\n\r;|,]+/;
const NAME_NOISE = /^[\s\-–—:()[\].#]+|[\s\-–—:()[\].#]+$/g;

/**
 * A role label the form prepends, as in "Leader: NLR (2520030366)".
 * It describes the person's place on the team, not their name.
 */
const ROLE_PREFIX = /^(?:team\s+)?(?:leader|member|participant|captain)\s*\d*\s*[:\-–—.]\s*/i;

function cleanName(value: string): string {
  return value
    .replace(ROLE_PREFIX, "")
    .replace(NAME_NOISE, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function parseCombinedMembers(cell: string): ParsedMember[] {
  if (!cell || !cell.trim()) return [];

  const members: ParsedMember[] = [];
  const seen = new Set<string>();
  let pendingName = "";

  for (const rawPiece of cell.split(ENTRY_SEPARATORS)) {
    const piece = rawPiece.trim();
    if (!piece) continue;

    const idMatch = piece.match(ID_PATTERN);
    const name = cleanName(idMatch ? piece.replace(idMatch[0], " ") : piece);

    if (!idMatch) {
      // A bare name: hold it for the id that follows in the next piece.
      if (name) pendingName = name;
      continue;
    }

    const registrationId = idMatch[0];
    const resolvedName = name || pendingName;
    pendingName = "";

    // An id with no name anywhere is not enough to print a certificate.
    if (!resolvedName) continue;

    const key = registrationId.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    members.push({ name: resolvedName, registrationId });
  }

  return members;
}
