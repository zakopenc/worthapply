-- Adds metadata + email_body_content columns to cover_letters so the
-- hiring-manager-grade triage output (structure_format, tone_preset_used,
-- opener_type, concerns_addressed, needs_company_signal, ai_tell_flags,
-- key_points_addressed, user_company_signal, reasoning) can be persisted
-- alongside the attached-letter text and the email-body variant.
--
-- Safe to run multiple times; both ADDs are idempotent via IF NOT EXISTS.

ALTER TABLE public.cover_letters
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS email_body_content TEXT;
