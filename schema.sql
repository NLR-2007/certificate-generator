-- ====================================================================
-- KLH UNIVERSITY CERTIFICATE GENERATOR & VERIFICATION DATABASE SCHEMA
-- Target Database: Supabase PostgreSQL
-- ====================================================================

-- 1. PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT,
  college TEXT DEFAULT 'Koneru Lakshmaiah Education Foundation, Bachupally',
  event_name TEXT NOT NULL DEFAULT 'Smart India Hackathon 2026',
  team_name TEXT,
  eligible BOOLEAN DEFAULT true NOT NULL,
  certificate_generated BOOLEAN DEFAULT false NOT NULL,
  certificate_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for fast registration ID lookups
CREATE INDEX IF NOT EXISTS idx_participants_registration_id ON public.participants (registration_id);

-- 2. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id TEXT UNIQUE NOT NULL,
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  registration_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  issue_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  template_id UUID,
  verification_token TEXT UNIQUE NOT NULL,
  pdf_url TEXT,
  status TEXT DEFAULT 'VALID' CHECK (status IN ('VALID', 'REVOKED', 'EXPIRED')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for fast public verification by certificate_id
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON public.certificates (certificate_id);

-- 3. CERTIFICATE TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  active BOOLEAN DEFAULT false NOT NULL,
  configuration JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  admin_id UUID,
  participant_id UUID,
  certificate_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow serverless function (service role) full access
CREATE POLICY "Allow server access for participants" ON public.participants
  FOR ALL USING (true);

-- Allow public read access only for public verification table (without sensitive info)
CREATE POLICY "Allow public read for verification" ON public.certificates
  FOR SELECT USING (true);

-- SEED PARTICIPANT DEMO RECORDS
INSERT INTO public.participants (registration_id, name, email, department, college, event_name, eligible)
VALUES 
  ('252003001', 'Akhil Reddy', 'akhil.reddy@klh.edu.in', 'CSE', 'Koneru Lakshmaiah Education Foundation, Bachupally', 'Smart India Hackathon 2026', true),
  ('252003002', 'Rahul Kumar', 'rahul.k@klh.edu.in', 'ECE', 'Koneru Lakshmaiah Education Foundation, Bachupally', 'Smart India Hackathon 2026', false),
  ('252003003', 'Venkata Sai Sri Lakshmi Narasimha Reddy', 'vssln.reddy@klh.edu.in', 'CSE', 'Koneru Lakshmaiah Education Foundation, Bachupally', 'Smart India Hackathon 2026', true)
ON CONFLICT (registration_id) DO NOTHING;
