import Papa from "papaparse";
import { z } from "zod";

export const ParticipantRowSchema = z.object({
  registration_id: z.string().min(1, "Registration ID required"),
  name: z.string().min(1, "Name required"),
  email: z.string().email().optional().or(z.literal("")),
  department: z.string().optional(),
  college: z.string().optional(),
  event_name: z.string().default("Smart India Hackathon 2026"),
  eligible: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === "boolean") return val;
      return String(val).toLowerCase() === "true" || String(val) === "1";
    })
    .default(true),
});

export type ParticipantRow = z.infer<typeof ParticipantRowSchema>;

export interface CSVParseResult {
  totalRows: number;
  validRows: ParticipantRow[];
  invalidRows: { row: number; data: any; errors: string[] }[];
}

export function parseAndValidateCSV(csvText: string): CSVParseResult {
  const parseOutput = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const validRows: ParticipantRow[] = [];
  const invalidRows: { row: number; data: any; errors: string[] }[] = [];

  parseOutput.data.forEach((rowRaw: any, idx: number) => {
    const validation = ParticipantRowSchema.safeParse(rowRaw);
    if (validation.success) {
      validRows.push(validation.data);
    } else {
      const errMsgs = validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      invalidRows.push({
        row: idx + 1,
        data: rowRaw,
        errors: errMsgs,
      });
    }
  });

  return {
    totalRows: parseOutput.data.length,
    validRows,
    invalidRows,
  };
}

export function generateRejectedRowsCSV(invalidRows: { row: number; data: any; errors: string[] }[]): string {
  const exportData = invalidRows.map((item) => ({
    ...item.data,
    import_errors: item.errors.join("; "),
  }));
  return Papa.unparse(exportData);
}
