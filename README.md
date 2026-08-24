# KLH University Certificate Generator & Verification Portal

Official, production-ready **Certificate Generator and Verification Platform** built for **Internal Smart India Hackathon 2026** organized by ED Cell & IIC, Koneru Lakshmaiah Education Foundation (KLH University Bachupally).

Designed specifically for **Vercel Serverless Deployment** with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **pdf-lib**, **qrcode**, and **Supabase**.

---

## 🌟 Key Features

1. **Official Unaltered Template Engine**:
   - Uses the official institutional certificate PDF template (`SIH-participation-template.pdf`) without modifying underlying artwork.
2. **Server-Side Verified Name Lock**:
   - Participants enter their Roll Number / Registration ID (e.g. `252003001`). The system retrieves their official verified name from the database. Manual name alterations by users are strictly disallowed.
3. **Dynamic Font Scale & Dynamic Centering**:
   - Fits short names ("Akhil Reddy") and very long names ("Venkata Sai Sri Lakshmi Narasimha Reddy") perfectly on the certificate line without overflowing.
4. **Cryptographic QR Code Verification**:
   - Embeds a high-density QR code on every generated PDF pointing to `https://domain.com/verify/SIH26-XXXXXX`.
5. **In-Browser PDF Preview & Download**:
   - Preview generated certificates dynamically in browser iframe without requiring immediate download.
6. **Public Verification Portal**:
   - `/verify/[certificateId]` displays green `Certificate Verified ✓` or red `Certificate Revoked ✕` with participant metadata.
7. **Admin Suite & CSV Importer**:
   - Manage eligible participants, toggle certificate revocation, drag-and-drop CSV upload with rejected row diagnostic export.
8. **Zero-Config Development Mock Mode**:
   - Operates out-of-the-box in local dev mode using an in-memory/JSON store if Supabase keys are not yet configured.

---

## 🏗️ Architecture Stack

```text
Browser Client
   ↓ (HTTPS / REST)
Next.js App Router (React Server & Client Components + Tailwind CSS)
   ↓ (Vercel Serverless Functions)
Certificate Engine (pdf-lib + qrcode + Dynamic Font Scale)
   ↓ (Supabase JS Client with RLS)
Supabase DB (PostgreSQL) + Supabase Storage
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
- **Seeded Department Roll Numbers**: 289 official student registration IDs across **AI&DS**, **CS&IT**, **ECE**, and **CSE** departments (e.g. `2520080006`, `2520090002`, `2520040001`, `2520030015`).

---

## 🔥 Database & Real-Time Sync (Firebase Firestore)

Data lives in **Cloud Firestore**, which is what makes the portal survive
restarts, stay consistent across serverless instances, and push live updates to
every open admin dashboard.

The app runs **without** Firebase too - it falls back to an in-memory store so
local development is zero-config. The admin dashboard shows which mode is active
via a **Live sync** / **Local only** badge. In `Local only` mode data is lost on
restart and is not shared between instances, so do not issue real certificates.

### Setup (Firebase Spark / free plan is sufficient)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) - no card required.
2. **Build > Firestore Database > Create database** (production mode).
3. **Project settings > Service accounts > Generate new private key**. From the
   downloaded JSON copy `project_id`, `client_email` and `private_key` into
   `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
   Keep the private key on one line, in double quotes, with its `
` sequences intact.
4. **Project settings > Your apps > Web app**. Copy the config into the four
   `NEXT_PUBLIC_FIREBASE_*` variables. These are safe to expose - access is
   controlled by security rules, not by hiding the key.
5. Publish the rules in [`firestore.rules`](./firestore.rules) (paste into
   **Firestore > Rules**, or `firebase deploy --only firestore:rules`).
6. Restart the app, sign in at `/admin`, and POST once to `/api/admin/seed` to
   copy the built-in 289-participant roster into Firestore. Seeding is
   idempotent - existing records are skipped, never overwritten.

### What syncs live

Certificates (issue + revoke) and hackathon form submissions stream into the
admin dashboard the moment they change, for every signed-in admin.

### Security model

The browser is trusted with nothing by default. All public traffic - certificate
generation, public verification, the registration form - goes through Next.js API
routes using the Admin SDK. The **only** browser-side Firestore access is the
admin dashboard's realtime listeners, authorised by a short-lived Firebase custom
token minted at login carrying an `admin` claim. Writes from a browser are denied
outright.

This matters because Firestore rules grant access per document, not per field:
letting the public verify page read `certificates` directly would expose every
`verification_token`. Keeping public reads server-side avoids that.

### Cost note (Spark limits)

Spark allows 50K document reads and 20K writes per day. A realtime listener is
billed for its initial snapshot plus each changed document, so a dashboard load
costs roughly one read per document watched. At 289 participants that is
comfortable, but avoid adding polling on top of the listeners.

Spark does **not** include Cloud Storage or Cloud Functions. Neither is used:
PDFs are generated on demand and streamed, and all server logic runs in Next.js
API routes. Storing generated PDFs or uploading template artwork would require
the Blaze plan.

---

## 🗄️ Legacy: Supabase SQL Schema (unused)

`schema.sql` targets Postgres and predates the Firestore migration. It is kept
for reference only - no code path reads it.

<details>
<summary>Original Supabase instructions</summary>


When deploying to production Supabase:
1. Open your Supabase Project SQL Editor.
2. Run the contents of [`schema.sql`](file:///d:/SIH-Certificate/schema.sql).
3. Set your environment variables in `.env.local` or Vercel Settings:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   ADMIN_SECRET_KEY=your-admin-passphrase
   ```

</details>

---

## 🚢 Deploying to Vercel

1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com) $\rightarrow$ **Add New Project**.
3. Select this repository.
4. Configure Environment Variables: the `FIREBASE_*` and `NEXT_PUBLIC_FIREBASE_*`
   keys, plus `NEXT_PUBLIC_SITE_URL` and `ADMIN_SECRET_KEY`. Without the Firebase
   keys each serverless instance keeps its own in-memory copy of the data, so
   issued certificates and registrations will appear to vanish at random.
5. Click **Deploy**.

---

## 🔒 Security Measures

- **Input Validation**: Enforced via Zod schemas.
- **Admin Authentication**: The admin passphrase lives only in `ADMIN_SECRET_KEY`
  on the server. A successful login mints an HMAC-signed, 8-hour, httpOnly
  session cookie. Every `/api/admin/*` route verifies that cookie independently,
  and `middleware.ts` redirects unauthenticated visitors away from `/admin`.
- **Data Protection**: Public verification route `/verify/[certificateId]` never exposes private emails, phone numbers, verification tokens, or database IDs.
- **Unguessable Identifiers**: Certificate IDs and verification tokens are drawn
  from `crypto` (not `Math.random`), so a public ID cannot be predicted from another.
- **Server-Side Rendering**: Certificate generation occurs entirely in serverless route handlers, and the participant database is never shipped to the browser.

---

## ⚠️ Known Limitation: In-Memory Fallback

Without Firebase configured, participants, certificates and form submissions live
in an in-memory store (`lib/db/mock-store.ts`) held on `globalThis`. It survives
dev hot-reloads, but **not** a server restart, and it is not shared between
serverless instances. Configure Firebase before issuing certificates you intend
to keep. The admin dashboard shows `Local only` whenever this fallback is active.

---

## 📄 License
Created for Koneru Lakshmaiah Education Foundation (KLH University Bachupally) - Internal Smart India Hackathon 2026.
