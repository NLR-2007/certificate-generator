# KLH University Certificate Generator & Verification Portal

Official, production-ready **Certificate Generator and Verification Platform** built for **Internal Smart India Hackathon 2026** organized by ED Cell & IIC, Koneru Lakshmaiah Education Foundation (KLH University Bachupally).

Designed specifically for **Vercel Serverless Deployment** with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **pdf-lib**, **qrcode**, and a Google Sheet as the participant database.

---

## 🌟 Key Features

1. **Official Unaltered Template Engine**:
   - Uses the official institutional certificate PDF template (`SIH-participation-template.pdf`) without modifying underlying artwork.
2. **Server-Side Verified Name Lock**:
   - Participants enter their Roll Number / Registration ID (e.g. `252003001`). The system retrieves their official verified name from the database. Manual name alterations by users are strictly disallowed.
3. **Dynamic Font Scale & Dynamic Centering**:
   - Fits short names ("Akhil Reddy") and very long names ("Venkata Sai Sri Lakshmi Narasimha Reddy") perfectly on the certificate line without overflowing.
4. **Cryptographic QR Code Verification**:
   - Embeds a high-density QR code on every generated PDF pointing to `https://domain.com/verify/SIH26-2520030366-K7M2QXB4`.
5. **In-Browser PDF Preview & Download**:
   - Preview generated certificates dynamically in browser iframe without requiring immediate download.
6. **Public Verification Portal**:
   - `/verify/[certificateId]` displays green `Certificate Verified ✓` or red `Certificate Revoked ✕` with participant metadata.
7. **Admin Suite & CSV Importer**:
   - Manage eligible participants, toggle certificate revocation, drag-and-drop CSV upload with rejected row diagnostic export.
8. **No Database To Run**:
   - Participants live in a Google Sheet read as CSV; certificate IDs are HMAC-signed so verification needs no stored record. Falls back to a bundled roster if the sheet is unreachable.

---

## 🏗️ Architecture Stack

```text
Browser Client
   ↓ (HTTPS / REST)
Next.js App Router (React Server & Client Components + Tailwind CSS)
   ↓ (Vercel Serverless Functions)
Certificate Engine (pdf-lib + qrcode + Dynamic Font Scale)
   ↓ (HMAC-signed certificate IDs - no record to store)
Google Sheet, read as CSV (the participant database)
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Copy Environment Variables
```bash
cp .env.example .env.local
```

### 3. Set the Admin Passphrase

The admin portal is gated by a **server-side** secret. Set it in `.env.local`:

```env
ADMIN_SECRET_KEY=choose-a-strong-passphrase
```

If `ADMIN_SECRET_KEY` is unset, `/admin/login` returns `503` and every admin API
refuses requests — the portal fails closed rather than open.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Checks
```bash
npm test        # unit tests (vitest)
npm run typecheck
npm run lint
```

---

## 🧪 Testing Demo Data

- **Admin Portal**: `/admin/login`, using whatever value you set for `ADMIN_SECRET_KEY`.
  The passphrase is verified on the server and exchanged for a signed, httpOnly
  session cookie — it is never embedded in the client bundle.
- **Bundled Roll Numbers**: with no roster sheet configured, the app serves 289
  official student registration IDs across **AI&DS**, **CS&IT**, **ECE** and
  **CSE** (e.g. `2520080006`, `2520090002`, `2520040001`, `2520030015`), so
  `/generate` works the moment you clone the repo.

---

## 📊 The Database Is a Google Sheet

There is no database server, no Firebase, no Supabase. Two things replace one:

**Participants come from a Google Sheet.** The app reads the sheet's CSV export
directly on every lookup (cached for 60 seconds), so editing a row in the sheet
is live within a minute. Nothing to sync, nothing to import, nothing to keep in
step.

**Certificates verify themselves.** A certificate ID is an HMAC of the
registration ID under a server-only secret:

```text
SIH26-2520030366-K7M2QXB4
\___/ \________/ \______/
event    reg id   signature
```

`/verify/[id]` recomputes the signature and then confirms the person is on the
roster sheet. Forging an ID means forging the HMAC, which needs the secret — and
the secret never leaves the server. Because the ID is derived from the
registration ID rather than randomly drawn, the same participant always resolves
to the same certificate, which is what prevents a second one being issued.

### Setting up the sheet

1. Create (or open) the roster Google Sheet.
2. **Share → General access → Anyone with the link → Viewer.** The app reads it
   anonymously; without this it cannot see the sheet at all.
3. Put its URL in `PARTICIPANTS_SHEET_URL`.

### Recognised columns

Headers are matched case- and punctuation-insensitively, so `Registration ID`,
`registration_id` and `registration id` are all the same column.

| Purpose | Accepted headers | Required |
| --- | --- | --- |
| Roll number | `Registration ID`, `Roll Number`, `Leader Roll ID`, `Roll ID`, `Reg ID`, `ID` | ✅ |
| Name | `Name`, `Full Name`, `Leader Name`, `Participant Name` | ✅ |
| Contact | `Email`, `Phone` | — |
| Detail | `Department`, `Team Name`, `Event Name` | — |
| Eligibility | `Eligible` — `TRUE`/`FALSE` | — |
| Revocation | `Revoked` — `TRUE` fails public verification | — |
| Team members | `All Team Member Names & IDs`, or `Member 2 Name` + `Member 2 Roll ID` … up to `Member 10` | — |

Omit the `Eligible` column entirely and everyone on the sheet is treated as
eligible — a roster sheet lists the people who took part.

Team members can be listed in one cell in whatever shape students typed them:

```text
Marri Hruthika - 2520090002, K Gayathri - 2520080010
Marri Hruthika (2520090002)
Marri Hruthika, 2520090002, K Gayathri, 2520080010
2520090002 Marri Hruthika
```

Every member becomes an individually verifiable participant, because
certificates are issued per person, not per team.

### Revoking a certificate

Set that participant's `Revoked` column to `TRUE` in the sheet. The admin
dashboard's revoke button re-reads the sheet and reports whether the change has
landed — it cannot write to the sheet, because Google's CSV export is read-only.

### The signing secret

`CERTIFICATE_SIGNING_SECRET` is what makes certificate IDs unforgeable. Generate
one with `openssl rand -hex 32`, set it in Vercel, and **never change it**: every
certificate already issued verifies against that exact value, so changing it
invalidates all of them at once.

If it is unset the app still works and stays self-consistent, but falls back to a
secret committed to this repository — meaning anyone who reads the source can
mint a valid-looking certificate ID. Set it before issuing certificates that
matter.

### When the sheet cannot be read

If the sheet is unshared, unreachable, or empty, lookups fall back to the
289-participant roster bundled in `lib/db/mock-store.ts` and a warning is logged.
The site keeps working rather than going down — but it is serving stale data, so
check the sharing setting if names look out of date.

---

## 🚢 Deploying to Vercel

1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com) $\rightarrow$ **Add New Project**.
3. Select this repository.
4. Configure Environment Variables:

   | Variable | Why it matters |
   | --- | --- |
   | `PARTICIPANTS_SHEET_URL` | The roster sheet. Without it the app serves the bundled roster instead. |
   | `CERTIFICATE_SIGNING_SECRET` | Makes certificate IDs unforgeable. Set it once and never change it. |
   | `NEXT_PUBLIC_SITE_URL` | The public origin baked into every QR code. Must be the real domain. |
   | `ADMIN_SECRET_KEY` | The admin passphrase. `/admin` is unusable while unset. |
   | `CERTIFICATE_ISSUE_DATE` | Optional. Fixes the date printed on every certificate. |

5. Click **Deploy**. There is no database to provision and nothing to seed.

---

## 🔒 Security Measures

- **Input Validation**: Enforced via Zod schemas.
- **Admin Authentication**: The admin passphrase lives only in `ADMIN_SECRET_KEY`
  on the server. A successful login mints an HMAC-signed, 8-hour, httpOnly
  session cookie. Every `/api/admin/*` route verifies that cookie independently,
  and `middleware.ts` redirects unauthenticated visitors away from `/admin`.
- **Data Protection**: Public verification route `/verify/[certificateId]` never exposes private emails, phone numbers, verification tokens, or database IDs.
- **Unforgeable Identifiers**: A certificate ID carries an HMAC-SHA256 signature
  over its registration ID, compared in constant time. Editing either half of an
  ID breaks the signature, and producing a valid one requires
  `CERTIFICATE_SIGNING_SECRET`, which never leaves the server.
- **No Trust In The Browser**: The name printed on a certificate always comes
  from the roster sheet, never from the request. A visitor supplies only a
  registration ID.
- **Server-Side Rendering**: Certificate generation occurs entirely in serverless route handlers, and the participant database is never shipped to the browser.

---

## ⚠️ Known Limitations

- **Sheet reads are cached for 60 seconds.** An edit in the sheet takes up to a
  minute to appear. The admin dashboard's **Re-read Roster Sheet** button clears
  the cache immediately.
- **The app cannot write to the sheet.** Google's CSV export is read-only, so
  admin edits to a participant (and certificate revocation) are changes you make
  in the sheet itself. The admin UI reads back and confirms them.
- **Form-builder configuration is not persisted.** Edits to the registration form
  layout live in memory and reset when the serverless instance recycles.
  Submitted registrations are unaffected — those go straight to the Apps Script
  webhook and land in the sheet.

---

## 📄 License
Created for Koneru Lakshmaiah Education Foundation (KLH University Bachupally) - Internal Smart India Hackathon 2026.
