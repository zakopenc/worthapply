-- Add Apply/Skip Engine fields to job_analyses
-- These columns store the structured decision output from the AI analysis

ALTER TABLE public.job_analyses
  ADD COLUMN IF NOT EXISTS apply_decision TEXT,
  ADD COLUMN IF NOT EXISTS decision_reasoning JSONB,
  ADD COLUMN IF NOT EXISTS biggest_strengths JSONB,
  ADD COLUMN IF NOT EXISTS biggest_risks JSONB,
  ADD COLUMN IF NOT EXISTS what_to_fix_before_applying JSONB,
  ADD COLUMN IF NOT EXISTS recommended_next_step TEXT;

-- apply_decision is one of: APPLY_NOW | TAILOR_FIRST | APPLY_IF_REFERRED | STRETCH_IF_PRIORITY_COMPANY | SKIP
-- decision_reasoning, biggest_strengths, biggest_risks, what_to_fix_before_applying are TEXT[] stored as JSONB arrays
