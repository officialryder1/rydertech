-- Add lead-scoring columns to contact_submissions
-- This table receives leads from contact form, voice agent, AI widget, course interest
-- The columns are used by the admin dashboard for lead scoring and filtering

ALTER TABLE IF EXISTS public.contact_submissions ADD COLUMN IF NOT EXISTS lead_score INTEGER;
ALTER TABLE IF EXISTS public.contact_submissions ADD COLUMN IF NOT EXISTS lead_tier TEXT;
ALTER TABLE IF EXISTS public.contact_submissions ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE IF EXISTS public.contact_submissions ADD COLUMN IF NOT EXISTS lead_source TEXT;

-- Index for segment filtering in admin dashboard
CREATE INDEX IF NOT EXISTS idx_contact_lead_score ON public.contact_submissions(lead_score);
CREATE INDEX IF NOT EXISTS idx_contact_lead_tier ON public.contact_submissions(lead_tier);
CREATE INDEX IF NOT EXISTS idx_contact_lead_source ON public.contact_submissions(lead_source);
CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_submissions(status);