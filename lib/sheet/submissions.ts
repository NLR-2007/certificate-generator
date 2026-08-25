import { FormField, FormSubmission } from "@/lib/db/mock-store";
import { SheetRow, pickColumn } from "./client";

/**
 * Maps a sheet row onto the registration form's field ids.
 *
 * The admin responses table reads `submission.data[field.id]` - `name`,
 * `registration_id`, `team_name`. A sheet row is keyed by whatever the sheet's
 * headers say instead ("Leader Name", "Leader Roll ID", "Team Name"), so
 * without translation every cell renders as a dash.
 *
 * Three strategies, in order: the field id itself, the field's label, then a
 * table of known aliases. The first two mean a field an admin adds in the form
 * builder works without touching this file.
 */
const FIELD_ALIASES: Record<string, string[]> = {
  name: ["Name", "Full Name", "Leader Name", "Participant Name", "Student Name"],
  registration_id: [
    "Registration ID",
    "Roll Number / Reg ID",
    "Leader Roll ID",
    "Roll ID",
    "Roll Number",
    "Reg ID",
    "ID",
  ],
  email: ["Email", "Student Email Address", "Email Address", "Mail"],
  phone: ["Phone", "WhatsApp Contact Number", "Contact Number", "Mobile", "Mobile Number"],
  department: ["Department", "Department / Campus", "Branch", "Campus"],
  team_name: ["Team Name", "Team", "Hackathon Team Name"],
  team_role: ["Team Role", "Role"],
  project_title: ["Project Title", "Proposed Project Title / Idea", "Project", "Idea"],
  team_members: ["All Team Member Names & IDs", "Team Members", "Members"],
};

export const TIMESTAMP_HEADERS = ["Timestamp", "timestamp", "Submitted At", "submitted_at", "Date"];

export function mapRowToSubmissionData(
  row: SheetRow,
  fields: FormField[]
): Record<string, string> {
  // Start from the raw row so nothing in the sheet is lost - the responses
  // table only reads known ids, but search runs over the whole object.
  const data: Record<string, string> = { ...row };

  for (const field of fields) {
    const value = pickColumn(row, [
      field.id,
      field.label,
      ...(FIELD_ALIASES[field.id] ?? []),
    ]);

    if (value) data[field.id] = value;
  }

  return data;
}

export function mapRowsToSubmissions(
  rows: SheetRow[],
  fields: FormField[]
): FormSubmission[] {
  return rows.map((row, index) => ({
    // Sheets have no stable row id, so number them by position. Newest first
    // below, which matches how the responses table is read.
    id: `SUB-${rows.length - index}`,
    submitted_at: pickColumn(row, TIMESTAMP_HEADERS) || "",
    data: mapRowToSubmissionData(row, fields),
  }));
}
