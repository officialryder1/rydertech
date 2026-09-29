-- Add lead-scoring columns to newsletter_subscriptions
-- This table receives lead captures from /labs tools (revleak, website-rater, etc.)
-- The columns were added to the codebase but the table was created without them.
-- Run this SQL in the Supabase SQL Editor: https://supabase.com/docs/guides/database

ALTER TABLE IF EXISTS public.newsletter_subscriptions ADD COLUMN IF NOT EXISTS lead_score INTEGER;
ALTER TABLE IF EXISTS public.newsletter_subscriptions ADD COLUMN IF NOT EXISTS lead_tier TEXT;
ALTER TABLE IF EXISTS public.newsletter_subscriptions ADD COLUMN IF NOT EXISTS company TEXT;

-- Index for segment filtering in admin dashboard
CREATE INDEX IF NOT EXISTS idx_newsletter_lead_score ON public.newsletter_subscriptions(lead_score);
CREATE INDEX IF NOT EXISTS idx_newsletter_lead_tier ON public.newsletter_subscriptions(lead_tier);
CREATE INDEX IF NOT EXISTS idx_newsletter_source ON public.newsletter_subscriptions(source);
