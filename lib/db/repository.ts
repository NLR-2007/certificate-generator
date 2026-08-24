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

function rosterSheetUrl(): string | undefined {
  return process.env.PARTICIPANTS_SHEET_URL?.trim() || formConfig.googleSheetUrl;
}

function eventName(): string {
  return process.env.EVENT_NAME?.trim() || formConfig.title || "Smart India Hackathon 2026";
}

/** Bundled roster, shaped like sheet participants so callers see one type. */
function bundledParticipants(): SheetParticipant[] {
  return INITIAL_PARTICIPANTS.map((p) => ({ ...p, revoked: false }));
}

export class SheetRepository implements DataRepository {
  readonly backend = "sheet" as const;

  private async roster(): Promise<SheetParticipant[]> {
    const url = rosterSheetUrl();
    if (!url) return bundledParticipants();

    try {
      const rows = await fetchSheetRows(url);
      const participants = mapRowsToParticipants(rows, { eventName: eventName() });
      return participants.length > 0 ? participants : bundledParticipants();
    } catch (error) {
      if (error instanceof SheetUnavailableError) {
        console.warn("Roster sheet unreadable, using bundled roster:", error.message);
      } else {
        console.error("Roster sheet lookup failed, using bundled roster:", error);
      }
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

  /** Live registrations, read back out of the sheet the webhook writes to. */
  async getFormSubmissions(): Promise<FormSubmission[]> {
    const url = rosterSheetUrl();
    if (!url) return mockDb.getFormSubmissions();

    try {
      const rows = await fetchSheetRows(url);
      return rows.map((row, index) => ({
        id: `SUB-${index + 1}`,
        submitted_at:
          row["Timestamp"] || row["timestamp"] || row["Submitted At"] || new Date().toISOString(),
        data: row,
      }));
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
