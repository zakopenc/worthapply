-- Interview Prep Studio + Offer Evaluation / Salary Negotiation
-- Adds two new tables for the Premium-tier modules that were previously
-- marketed but not implemented.
--
-- Safe to run multiple times; uses IF NOT EXISTS throughout.

CREATE TABLE IF NOT EXISTS public.interview_preps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.job_analyses(id) ON DELETE CASCADE NOT NULL,
  interview_stage TEXT NOT NULL DEFAULT 'behavioral',
  interviewer_notes TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_preps_user_id ON public.interview_preps(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_preps_application_id ON public.interview_preps(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_preps_version ON public.interview_preps(application_id, version DESC);

ALTER TABLE public.interview_preps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interview_preps_owner_select" ON public.interview_preps;
CREATE POLICY "interview_preps_owner_select"
  ON public.interview_preps FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "interview_preps_owner_insert" ON public.interview_preps;
CREATE POLICY "interview_preps_owner_insert"
  ON public.interview_preps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "interview_preps_owner_update" ON public.interview_preps;
CREATE POLICY "interview_preps_owner_update"
  ON public.interview_preps FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "interview_preps_owner_delete" ON public.interview_preps;
CREATE POLICY "interview_preps_owner_delete"
  ON public.interview_preps FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.offer_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  offer_text TEXT,
  parsed_offer JSONB NOT NULL DEFAULT '{}'::jsonb,
  projection JSONB NOT NULL DEFAULT '{}'::jsonb,
  negotiation JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offer_evaluations_user_id ON public.offer_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_offer_evaluations_application_id ON public.offer_evaluations(application_id);
CREATE INDEX IF NOT EXISTS idx_offer_evaluations_version ON public.offer_evaluations(application_id, version DESC);

ALTER TABLE public.offer_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "offer_evaluations_owner_select" ON public.offer_evaluations;
CREATE POLICY "offer_evaluations_owner_select"
  ON public.offer_evaluations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "offer_evaluations_owner_insert" ON public.offer_evaluations;
CREATE POLICY "offer_evaluations_owner_insert"
  ON public.offer_evaluations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "offer_evaluations_owner_update" ON public.offer_evaluations;
CREATE POLICY "offer_evaluations_owner_update"
  ON public.offer_evaluations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "offer_evaluations_owner_delete" ON public.offer_evaluations;
CREATE POLICY "offer_evaluations_owner_delete"
  ON public.offer_evaluations FOR DELETE
  USING (auth.uid() = user_id);
