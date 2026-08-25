import {
  CertificateRecord,
  DEFAULT_FORM_CONFIG,
  FormConfig,
  FormSubmission,
  INITIAL_PARTICIPANTS,
  Participant,
  mockDb,
} from "./mock-store";
import {
  SheetUnavailableError,
  fetchSheetRows,
  invalidateSheetCache,
} from "@/lib/sheet/client";
import { SheetParticipant, mapRowsToParticipants } from "@/lib/sheet/participants";
import { mapRowsToSubmissions } from "@/lib/sheet/submissions";
import {
  DEFAULT_EVENT_PREFIX,
  certificateIdFor,
  certificateIssueDate,
  isAuthenticCertificateId,
  normaliseRegistrationId,
  parseCertificateId,
} from "@/lib/certificate/signing";

/**
 * The data-access layer.
 *
 * There is no database. Two sources stand behind this interface:
 *
 *   - The roster Google Sheet, read as CSV, which is the source of truth for
 *     who took part and whether their certificate stands.
 *   - The bundled roster in `mock-store`, used when the sheet cannot be read,
 *     so a sharing mistake degrades the app instead of breaking it.
 *
 * Certificates are not stored anywhere. A certificate id is an HMAC of the
 * registration id (see `lib/certificate/signing`), so it verifies itself: the
 * record returned here is reconstructed from the id plus the roster row.
 */
export interface DataRepository {
  readonly backend: "sheet";

  getParticipant(registrationId: string): Promise<Participant | undefined>;
  getAllParticipants(): Promise<Participant[]>;
  upsertParticipant(participant: Participant): Promise<Participant>;

  getCertificateById(certificateId: string): Promise<CertificateRecord | undefined>;
  getCertificateByRegistrationId(registrationId: string): Promise<CertificateRecord | undefined>;
  getAllCertificates(): Promise<CertificateRecord[]>;
  saveCertificate(cert: CertificateRecord): Promise<CertificateRecord>;
  updateCertificateStatus(certificateId: string, status: "VALID" | "REVOKED"): Promise<boolean>;

  getFormConfig(): Promise<FormConfig>;
  updateFormConfig(config: FormConfig): Promise<FormConfig>;
  saveFormSubmission(data: Record<string, string>): Promise<FormSubmission>;
  getFormSubmissions(): Promise<FormSubmission[]>;
}

/**
 * Form configuration lives in memory, seeded from the bundled default.
 *
 * An edit made in the admin form builder lasts only as long as the serverless
 * instance. Registrations themselves are unaffected - they are posted straight
 * to the Apps Script webhook and land in the sheet.
 */
let formConfig: FormConfig = DEFAULT_FORM_CONFIG;

/**
 * The sheet listing who is entitled to a certificate.
 *
 * Falls back to the registration sheet when no dedicated roster is configured,
 * which is right for a single event: whoever registered is who took part. Point
 * `PARTICIPANTS_SHEET_URL` at its own sheet to separate them - otherwise the
 * roster changes every time somebody fills in the registration form.
 */
function rosterSheetUrl(): string | undefined {
  return process.env.PARTICIPANTS_SHEET_URL?.trim() || formConfig.googleSheetUrl;
}

/** The sheet the registration form's webhook writes into. Always the form's own. */
function submissionsSheetUrl(): string | undefined {
  return formConfig.googleSheetUrl;
}

/**
 * The event printed on certificates and shown when verifying.
 *
 * Not `formConfig.title` - that is the registration form's heading ("Hackathon
 * Registration Form"), which is not the name of an event and read badly on a
 * certificate.
 */
function eventName(): string {
  return process.env.EVENT_NAME?.trim() || "Smart India Hackathon 2026";
}

/**
 * Where the roster currently in use came from, for the admin dashboard.
 * Reset on every read so it always describes the latest one.
 */
export type RosterSource = "sheet" | "bundled";

let lastRosterSource: RosterSource = "bundled";
let lastRosterNote: string | null = null;

export function getRosterStatus(): { source: RosterSource; note: string | null } {
  return { source: lastRosterSource, note: lastRosterNote };
}

/** Bundled roster, shaped like sheet participants so callers see one type. */
function bundledParticipants(): SheetParticipant[] {
  return INITIAL_PARTICIPANTS.map((p) => ({ ...p, revoked: false }));
}

export class SheetRepository implements DataRepository {
  readonly backend = "sheet" as const;

  private async roster(): Promise<SheetParticipant[]> {
    const url = rosterSheetUrl();

    if (!url) {
      lastRosterSource = "bundled";
      lastRosterNote = "No roster sheet is configured. Set PARTICIPANTS_SHEET_URL.";
      return bundledParticipants();
    }

    try {
      const rows = await fetchSheetRows(url);
      const participants = mapRowsToParticipants(rows, { eventName: eventName() });

      if (participants.length > 0) {
        lastRosterSource = "sheet";
        lastRosterNote = null;
        return participants;
      }

      lastRosterSource = "bundled";
      lastRosterNote =
        rows.length === 0
          ? "The roster sheet has no data rows yet, so the bundled roster is in use."
          : `The roster sheet has ${rows.length} rows but no recognisable Registration ID and Name columns, so the bundled roster is in use.`;
      return bundledParticipants();
    } catch (error) {
      const message =
        error instanceof SheetUnavailableError ? error.message : "The roster sheet could not be read.";
      console.warn("Roster sheet unavailable, using bundled roster:", message);
      lastRosterSource = "bundled";
      lastRosterNote = `${message} The bundled roster is in use.`;
      return bundledParticipants();
    }
  }

  private async findByRegistrationId(registrationId: string): Promise<SheetParticipant | undefined> {
    const key = normaliseRegistrationId(registrationId);
    return (await this.roster()).find((p) => normaliseRegistrationId(p.registration_id) === key);
  }

  /** Fills in the certificate id every eligible participant is entitled to. */
  private withCertificateId(participant: SheetParticipant): Participant {
    if (!participant.eligible) return participant;
    const certificateId = certificateIdFor(participant.registration_id);
    return { ...participant, certificate_generated: true, certificate_id: certificateId };
  }

  async getParticipant(registrationId: string): Promise<Participant | undefined> {
    const found = await this.findByRegistrationId(registrationId);
    return found ? this.withCertificateId(found) : undefined;
  }

  async getAllParticipants(): Promise<Participant[]> {
    return (await this.roster()).map((p) => this.withCertificateId(p));
  }

  /**
   * The sheet is read-only from here - Google's CSV export offers no write
   * path. Edits are applied to the in-memory overlay so an admin sees them take
   * effect, but the sheet stays authoritative on the next refresh.
   */
  async upsertParticipant(participant: Participant): Promise<Participant> {
    return mockDb.upsertParticipant(participant);
  }

  private toCertificateRecord(participant: SheetParticipant): CertificateRecord {
    const issued = certificateIssueDate().toISOString();
    return {
      id: `cert-${normaliseRegistrationId(participant.registration_id)}`,
      certificate_id: certificateIdFor(participant.registration_id),
      participant_id: participant.id,
      participant_name: participant.name,
      registration_id: participant.registration_id,
      event_name: participant.event_name,
      issue_date: issued,
      created_at: issued,
      status: participant.revoked || !participant.eligible ? "REVOKED" : "VALID",
    };
  }

  /**
   * Rebuilds the certificate from its id. Returns undefined when the signature
   * does not check out or the registration id is not on the roster, which is
   * what makes a forged or mistyped id fail verification.
   */
  async getCertificateById(certificateId: string): Promise<CertificateRecord | undefined> {
    const parsed = parseCertificateId(certificateId);
    if (!parsed || !isAuthenticCertificateId(certificateId)) return undefined;

    const participant = await this.findByRegistrationId(parsed.registrationId);
    if (!participant) return undefined;

    return this.toCertificateRecord(participant);
  }

  async getCertificateByRegistrationId(registrationId: string): Promise<CertificateRecord | undefined> {
    const participant = await this.findByRegistrationId(registrationId);
    if (!participant || !participant.eligible) return undefined;
    return this.toCertificateRecord(participant);
  }

  /** Every eligible participant holds exactly one certificate. */
  async getAllCertificates(): Promise<CertificateRecord[]> {
    return (await this.roster())
      .filter((p) => p.eligible)
      .map((p) => this.toCertificateRecord(p));
  }

  /** Nothing to persist: the id is the record. Returned unchanged. */
  async saveCertificate(cert: CertificateRecord): Promise<CertificateRecord> {
    return cert;
  }

  /**
   * Revocation is a property of the roster sheet, not of this app: set the
   * participant's `Revoked` column to TRUE (or `Eligible` to FALSE). Returns
   * false so callers can tell the admin where the switch actually lives.
   */
  async updateCertificateStatus(): Promise<boolean> {
    return false;
  }

  async getFormConfig(): Promise<FormConfig> {
    return formConfig;
  }

  async updateFormConfig(config: FormConfig): Promise<FormConfig> {
    formConfig = config;
    invalidateSheetCache();
    return formConfig;
  }

  async saveFormSubmission(data: Record<string, string>): Promise<FormSubmission> {
    return mockDb.saveFormSubmission(data);
  }

  /**
   * Live registrations, read back out of the sheet the webhook writes to.
   *
   * Rows are translated onto the form's field ids: the sheet is keyed by its own
   * headers, and the responses table reads by field id.
   */
  async getFormSubmissions(): Promise<FormSubmission[]> {
    const url = submissionsSheetUrl();
    if (!url) return mockDb.getFormSubmissions();

    try {
      const rows = await fetchSheetRows(url);
      const submissions = mapRowsToSubmissions(rows, formConfig.fields);
      // Newest first, matching how the dashboard reads them.
      return submissions.reverse();
    } catch (error) {
      console.warn("Could not read submissions from the sheet:", error);
      return mockDb.getFormSubmissions();
    }
  }
}

let cached: DataRepository | null = null;

export function getRepository(): DataRepository {
  if (!cached) cached = new SheetRepository();
  return cached;
}

/** Forces the next read to hit Google Sheets rather than the cached rows. */
export function refreshRoster(): void {
  invalidateSheetCache();
}

export { DEFAULT_EVENT_PREFIX };
