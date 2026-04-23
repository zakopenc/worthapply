-- Evidence Vault: reusable achievement/story bank for Premium users

CREATE TABLE IF NOT EXISTS public.evidence_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  category            TEXT NOT NULL CHECK (category IN ('achievement','project','leadership','technical','stakeholder','problem-solving')),
  situation           TEXT,
  action_taken        TEXT,
  result              TEXT,
  metrics             TEXT[] NOT NULL DEFAULT '{}',
  skills              TEXT[] NOT NULL DEFAULT '{}',
  tags                TEXT[] NOT NULL DEFAULT '{}',
  confidence          INTEGER NOT NULL DEFAULT 80 CHECK (confidence >= 0 AND confidence <= 100),
  needs_clarification BOOLEAN NOT NULL DEFAULT FALSE,
  questions_to_improve TEXT[] NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast per-user listing
CREATE INDEX IF NOT EXISTS evidence_items_user_id_idx ON public.evidence_items (user_id, created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_evidence_items_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS evidence_items_updated_at ON public.evidence_items;
CREATE TRIGGER evidence_items_updated_at
  BEFORE UPDATE ON public.evidence_items
  FOR EACH ROW EXECUTE FUNCTION public.set_evidence_items_updated_at();

-- RLS
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own evidence items"
  ON public.evidence_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evidence items"
  ON public.evidence_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evidence items"
  ON public.evidence_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own evidence items"
  ON public.evidence_items FOR DELETE
  USING (auth.uid() = user_id);
