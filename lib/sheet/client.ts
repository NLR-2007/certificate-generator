import Papa from "papaparse";

/**
 * Reads a published Google Sheet as CSV.
 *
 * The sheet is the single source of truth for this app - there is no database.
 * A sheet shared as "Anyone with the link can view" exposes a CSV export
 * endpoint that needs no API key and no OAuth, which is what makes a
 * database-free deployment possible on Vercel.
 *
 * Rows are cached in module memory for a short TTL. A serverless instance
 * handles many requests over its lifetime, so this turns a burst of lookups
 * into a single fetch without ever holding data long enough to go stale.
 */
export type SheetRow = Record<string, string>;

const CACHE_TTL_MS = 60_000;

interface CacheEntry {
  rows: SheetRow[];
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();

/** Pulls the spreadsheet id out of any Google Sheets URL shape. */
export function extractSpreadsheetId(sheetUrl: string): string | null {
  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] ?? null;
}

/** Pulls the tab id (`gid`) out of a sheet URL, when one is present. */
export function extractGid(sheetUrl: string): string | null {
  const match = sheetUrl.match(/[#&?]gid=([0-9]+)/);
  return match?.[1] ?? null;
}

export function buildCsvExportUrl(sheetUrl: string): string | null {
  const id = extractSpreadsheetId(sheetUrl);
  if (!id) return null;

  const gid = extractGid(sheetUrl);
  const base = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
  return gid ? `${base}&gid=${gid}` : base;
}

export function invalidateSheetCache(sheetUrl?: string): void {
  if (!sheetUrl) {
    cache.clear();
    return;
  }
  const url = buildCsvExportUrl(sheetUrl);
  if (url) cache.delete(url);
}

export class SheetUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SheetUnavailableError";
  }
}

/**
 * Fetches and parses the sheet. Throws `SheetUnavailableError` when the sheet
 * cannot be read so callers can decide whether to fall back or surface it -
 * a lookup should fall back to the bundled roster, an admin sync should not.
 */
export async function fetchSheetRows(
  sheetUrl: string,
  options: { force?: boolean } = {}
): Promise<SheetRow[]> {
  const csvUrl = buildCsvExportUrl(sheetUrl);
  if (!csvUrl) {
    throw new SheetUnavailableError("That does not look like a Google Sheets URL.");
  }

  const cached = cache.get(csvUrl);
  if (!options.force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rows;
  }

  let res: Response;
  try {
    res = await fetch(csvUrl, { cache: "no-store", redirect: "follow" });
  } catch {
    throw new SheetUnavailableError("Could not reach Google Sheets.");
  }

  if (!res.ok) {
    throw new SheetUnavailableError(
      "Could not read the Google Sheet. Set its sharing to \"Anyone with the link can view\"."
    );
  }

  const csv = await res.text();

  // A sheet that is not link-shared answers 200 with Google's sign-in page.
  if (csv.trimStart().startsWith("<")) {
    throw new SheetUnavailableError(
      "The Google Sheet is not publicly readable. Set its sharing to \"Anyone with the link can view\"."
    );
  }

  const parsed = Papa.parse<SheetRow>(csv, { header: true, skipEmptyLines: true });
  const rows = (parsed.data || []).filter((r) => r && Object.keys(r).length > 0);

  cache.set(csvUrl, { rows, fetchedAt: Date.now() });
  return rows;
}

/**
 * Reads a column by any of several header spellings, so the sheet's headers can
 * be renamed by an organiser without breaking the app.
 */
export function pickColumn(row: SheetRow, names: string[]): string {
  for (const name of names) {
    const direct = row[name];
    if (direct != null && String(direct).trim() !== "") return String(direct).trim();
  }

  // Fall back to a case- and space-insensitive scan of the actual headers.
  const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const wanted = names.map(normalise);

  for (const [key, value] of Object.entries(row)) {
    if (value != null && String(value).trim() !== "" && wanted.includes(normalise(key))) {
      return String(value).trim();
    }
  }

  return "";
}

/** Interprets the loose truthiness a spreadsheet column can carry. */
export function isTruthyCell(value: string): boolean {
  return ["true", "yes", "y", "1", "valid", "eligible", "approved"].includes(
    value.trim().toLowerCase()
  );
}
