-- Partner program leads: stores career coach / B2B partner applications
CREATE TABLE IF NOT EXISTS public.partner_leads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text NOT NULL,
  role_type     text NOT NULL,   -- coach type / audience segment
  client_volume text NOT NULL,   -- monthly client count range
  website       text,            -- optional
  notes         text,            -- optional extra message
  status        text NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  ref_code      text,            -- generated slug, populated when approved
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint so the same email can't submit twice
CREATE UNIQUE INDEX IF NOT EXISTS partner_leads_email_idx ON public.partner_leads (lower(email));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_partner_leads_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS partner_leads_updated_at ON public.partner_leads;
CREATE TRIGGER partner_leads_updated_at
  BEFORE UPDATE ON public.partner_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_partner_leads_updated_at();

-- RLS: service role only (no public reads/writes — all writes go through the API route with service key)
ALTER TABLE public.partner_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.partner_leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);
