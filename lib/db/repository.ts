import { Firestore } from "firebase-admin/firestore";
import { getAdminFirestore, isFirestoreConfigured } from "@/lib/firebase/admin";
import {
  CertificateRecord,
  FormConfig,
  FormSubmission,
  INITIAL_PARTICIPANTS,
  mockDb,
  Participant,
} from "./mock-store";

/**
 * The single data-access layer for the app.
 *
 * Two backends sit behind one async interface:
 *   - Firestore, when FIREBASE_* credentials are present. Data is shared across
 *     every serverless instance and survives restarts, which is what makes
 *     realtime sync possible at all.
 *   - The in-memory store, otherwise. Keeps local development zero-config, but
 *     data is per-instance and lost on restart.
 *
 * Every method is async so callers do not need to know which backend is active.
 */
export interface DataRepository {
  readonly backend: "firestore" | "memory";

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

/** Document ids, normalised so lookups are case and whitespace insensitive. */
const participantKey = (registrationId: string) => registrationId.trim().toLowerCase();
const certificateKey = (certificateId: string) => certificateId.trim().toUpperCase();

export const COLLECTIONS = {
  participants: "participants",
  certificates: "certificates",
  formConfig: "formConfig",
  formSubmissions: "formSubmissions",
} as const;

const FORM_CONFIG_DOC = "active";

class MemoryRepository implements DataRepository {
  readonly backend = "memory" as const;

  async getParticipant(registrationId: string) {
    return mockDb.findParticipantByRegId(registrationId);
  }
  async getAllParticipants() {
    return mockDb.getAllParticipants();
  }
  async upsertParticipant(participant: Participant) {
    return mockDb.upsertParticipant(participant);
  }
  async getCertificateById(certificateId: string) {
    return mockDb.findCertificateById(certificateId);
  }
  async getCertificateByRegistrationId(registrationId: string) {
    return mockDb.findCertificateByRegId(registrationId);
  }
  async getAllCertificates() {
    return mockDb.getAllCertificates();
  }
  async saveCertificate(cert: CertificateRecord) {
    return mockDb.saveCertificate(cert);
  }
  async updateCertificateStatus(certificateId: string, status: "VALID" | "REVOKED") {
    return mockDb.updateCertificateStatus(certificateId, status);
  }
  async getFormConfig() {
    return mockDb.getFormConfig();
  }
  async updateFormConfig(config: FormConfig) {
    return mockDb.updateFormConfig(config);
  }
  async saveFormSubmission(data: Record<string, string>) {
    return mockDb.saveFormSubmission(data);
  }
  async getFormSubmissions() {
    return mockDb.getFormSubmissions();
  }
}

class FirestoreRepository implements DataRepository {
  readonly backend = "firestore" as const;

  constructor(private readonly db: Firestore) {}

  async getParticipant(registrationId: string) {
    const snap = await this.db
      .collection(COLLECTIONS.participants)
      .doc(participantKey(registrationId))
      .get();
    return snap.exists ? (snap.data() as Participant) : undefined;
  }

  async getAllParticipants() {
    const snap = await this.db.collection(COLLECTIONS.participants).get();
    return snap.docs.map((d) => d.data() as Participant);
  }

  async upsertParticipant(participant: Participant) {
    await this.db
      .collection(COLLECTIONS.participants)
      .doc(participantKey(participant.registration_id))
      .set(participant, { merge: true });
    return participant;
  }

  async getCertificateById(certificateId: string) {
    const snap = await this.db
      .collection(COLLECTIONS.certificates)
      .doc(certificateKey(certificateId))
      .get();
    return snap.exists ? (snap.data() as CertificateRecord) : undefined;
  }

  async getCertificateByRegistrationId(registrationId: string) {
    // registration_id_key holds the normalised id, so this equality query works
    // without a composite index and without case-sensitivity surprises.
    const snap = await this.db
      .collection(COLLECTIONS.certificates)
      .where("registration_id_key", "==", participantKey(registrationId))
      .limit(1)
      .get();
    return snap.empty ? undefined : (snap.docs[0].data() as CertificateRecord);
  }

  async getAllCertificates() {
    const snap = await this.db
      .collection(COLLECTIONS.certificates)
      .orderBy("created_at", "desc")
      .get();
    return snap.docs.map((d) => d.data() as CertificateRecord);
  }

  async saveCertificate(cert: CertificateRecord) {
    const participantRef = this.db
      .collection(COLLECTIONS.participants)
      .doc(participantKey(cert.registration_id));
    const participantExists = (await participantRef.get()).exists;

    const batch = this.db.batch();

    batch.set(
      this.db.collection(COLLECTIONS.certificates).doc(certificateKey(cert.certificate_id)),
      { ...cert, registration_id_key: participantKey(cert.registration_id) },
      { merge: true }
    );

    if (participantExists) {
      batch.update(participantRef, {
        certificate_generated: true,
        certificate_id: cert.certificate_id,
      });
    }

    await batch.commit();
    return cert;
  }

  async updateCertificateStatus(certificateId: string, status: "VALID" | "REVOKED") {
    const ref = this.db.collection(COLLECTIONS.certificates).doc(certificateKey(certificateId));
    if (!(await ref.get()).exists) return false;
    await ref.update({ status });
    return true;
  }

  async getFormConfig() {
    const snap = await this.db.collection(COLLECTIONS.formConfig).doc(FORM_CONFIG_DOC).get();
    // Fall back to the built-in default until an admin saves one.
    return snap.exists ? (snap.data() as FormConfig) : mockDb.getFormConfig();
  }

  async updateFormConfig(config: FormConfig) {
    await this.db.collection(COLLECTIONS.formConfig).doc(FORM_CONFIG_DOC).set(config);
    return config;
  }

  async saveFormSubmission(data: Record<string, string>) {
    const submission: FormSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      submitted_at: new Date().toISOString(),
      data,
    };
    await this.db.collection(COLLECTIONS.formSubmissions).doc(submission.id).set(submission);
    return submission;
  }

  async getFormSubmissions() {
    const snap = await this.db
      .collection(COLLECTIONS.formSubmissions)
      .orderBy("submitted_at", "desc")
      .get();
    return snap.docs.map((d) => d.data() as FormSubmission);
  }
}

let cached: DataRepository | null = null;

export function getRepository(): DataRepository {
  if (cached) return cached;
  const db = getAdminFirestore();
  cached = db ? new FirestoreRepository(db) : new MemoryRepository();
  return cached;
}

export { isFirestoreConfigured };

/**
 * Copies the built-in participant roster into Firestore. Idempotent: records
 * that already exist are left untouched, so re-running never clobbers an edit
 * an admin made to a participant.
 */
export async function seedParticipants(): Promise<{ written: number; skipped: number }> {
  const db = getAdminFirestore();
  if (!db) throw new Error("Firestore is not configured.");

  let written = 0;
  let skipped = 0;

  // Firestore caps a batch at 500 writes.
  for (let i = 0; i < INITIAL_PARTICIPANTS.length; i += 400) {
    const chunk = INITIAL_PARTICIPANTS.slice(i, i + 400);
    const batch = db.batch();

    for (const p of chunk) {
      const ref = db.collection(COLLECTIONS.participants).doc(participantKey(p.registration_id));
      if ((await ref.get()).exists) {
        skipped++;
        continue;
      }
      batch.set(ref, p);
      written++;
    }

    await batch.commit();
  }

  return { written, skipped };
}
