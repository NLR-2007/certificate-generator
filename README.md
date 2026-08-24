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

## 🗄️ Database Setup (Supabase SQL)

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

---

## 🚢 Deploying to Vercel

1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com) $\rightarrow$ **Add New Project**.
3. Select this repository.
4. Configure Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_SECRET_KEY`).
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

## ⚠️ Known Limitation: In-Memory Store

Without Supabase configured, participants and issued certificates live in an
in-memory store (`lib/db/mock-store.ts`) held on `globalThis`. This survives dev
hot-reloads, but **not** a server restart, and it is not shared between serverless
instances. Configure Supabase before issuing certificates you intend to keep.

---

## 📄 License
Created for Koneru Lakshmaiah Education Foundation (KLH University Bachupally) - Internal Smart India Hackathon 2026.
