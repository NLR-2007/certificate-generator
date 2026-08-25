import { Participant } from "@/lib/db/mock-store";
import { SheetRow, isTruthyCell, pickColumn } from "./client";
import { parseCombinedMembers } from "./members";

/**
 * Turns raw sheet rows into participants.
 *
 * One row is one team: a leader plus up to `MAX_TEAM_MEMBERS` members in
 * numbered columns. Every person on the row becomes an individually verifiable
 * participant, because certificates are issued per person, not per team.
 */
const MAX_TEAM_MEMBERS = 10;

const REG_ID_HEADERS = [
  "registration_id",
  "Registration ID",
  "Leader Roll ID",
  "Roll ID",
  "Roll Number",
  "Reg ID",
  "ID",
];

const NAME_HEADERS = ["name", "Name", "Leader Name", "Full Name", "Participant Name"];
const EMAIL_HEADERS = ["email", "Email", "Student Email Address", "Email Address"];
const PHONE_HEADERS = ["phone", "Phone", "WhatsApp Contact Number", "Contact Number"];
const DEPT_HEADERS = ["department", "Department", "Department / Campus", "Branch"];
const TEAM_HEADERS = ["team_name", "Team Name", "Team", "Hackathon Team Name"];
const EVENT_HEADERS = ["event_name", "Event Name", "Event"];
const ELIGIBLE_HEADERS = ["eligible", "Eligible", "Approved", "Status"];
const REVOKED_HEADERS = ["revoked", "Revoked", "Cancelled", "Canceled"];
const COMBINED_MEMBERS_HEADERS = [
  "All Team Member Names & IDs",
  "All Team Member Names and IDs",
  "Team Members",
  "Team Member Names",
  "Members",
  "team_members",
];

export const DEFAULT_COLLEGE = "Koneru Lakshmaiah Education Foundation, Bachupally";

export interface SheetParticipant extends Participant {
  /** True when the sheet marks this person's certificate as withdrawn. */
  revoked: boolean;
}

function buildParticipant(
  registrationId: string,
  name: string,
  row: SheetRow,
  defaults: { eventName: string }
): SheetParticipant {
  const regId = registrationId.trim();
  const eligibleCell = pickColumn(row, ELIGIBLE_HEADERS);
  const revokedCell = pickColumn(row, REVOKED_HEADERS);

  return {
    id: `p-${regId}`,
    registration_id: regId,
    name: name.trim(),
    email: pickColumn(row, EMAIL_HEADERS),
    phone: pickColumn(row, PHONE_HEADERS),
    department: pickColumn(row, DEPT_HEADERS) || "CSE",
    college: DEFAULT_COLLEGE,
    event_name: pickColumn(row, EVENT_HEADERS) || defaults.eventName,
    team_name: pickColumn(row, TEAM_HEADERS) || "Hackathon Team",
    // Absent column means eligible: a roster sheet lists people who took part.
    eligible: eligibleCell === "" ? true : isTruthyCell(eligibleCell),
    certificate_generated: false,
    revoked: revokedCell !== "" && isTruthyCell(revokedCell),
  };
}

export function mapRowsToParticipants(
  rows: SheetRow[],
  defaults: { eventName: string }
): SheetParticipant[] {
  const byRegId = new Map<string, SheetParticipant>();

  for (const row of rows) {
    const leaderId = pickColumn(row, REG_ID_HEADERS);
    const leaderName = pickColumn(row, NAME_HEADERS);
    let leaderKey = "";

    if (leaderId && leaderName) {
      const leader = buildParticipant(leaderId, leaderName, row, defaults);
      leaderKey = leader.registration_id.toLowerCase();
      byRegId.set(leaderKey, leader);
    }

    // Members arrive either in numbered columns or all together in one cell.
    const members: { name: string; registrationId: string }[] = [];

    for (let i = 2; i <= MAX_TEAM_MEMBERS; i++) {
      const name = pickColumn(row, [`Member ${i} Name`, `member_${i}_name`]);
      const registrationId = pickColumn(row, [
        `Member ${i} Roll ID`,
        `member_${i}_id`,
        `Member ${i} ID`,
        `Member ${i} Registration ID`,
      ]);
      if (name && registrationId) members.push({ name, registrationId });
    }

    members.push(...parseCombinedMembers(pickColumn(row, COMBINED_MEMBERS_HEADERS)));

    for (const member of members) {
      const participant = buildParticipant(member.registrationId, member.name, row, defaults);
      const key = participant.registration_id.toLowerCase();

      // Teams often list their own leader in the members cell too ("Leader: NLR
      // (2520030366)"). The leader's dedicated columns are the better record, so
      // they are not overwritten by their own restatement.
      if (key === leaderKey) continue;

      // A member has no personal email or phone column on a team row.
      participant.email = "";
      participant.phone = "";
      byRegId.set(key, participant);
    }
  }

  return Array.from(byRegId.values());
}
