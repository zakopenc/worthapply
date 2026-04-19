-- User support tickets with optional screenshot attachments (storage paths).
-- Apply in Supabase SQL Editor or via supabase db push.

-- Storage bucket for screenshot uploads (private; paths: <user_id>/<ticket_id>/<filename>)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'support-attachments',
  'support-attachments',
  false,
  5242880,
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own support attachments" ON storage.objects;
CREATE POLICY "Users upload own support attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'support-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users read own support attachments" ON storage.objects;
CREATE POLICY "Users read own support attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'support-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users delete own support attachments" ON storage.objects;
CREATE POLICY "Users delete own support attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'support-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (char_length(subject) >= 1 AND char_length(subject) <= 200),
  body TEXT NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= 10000),
  attachment_paths TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);

CREATE INDEX IF NOT EXISTS support_tickets_user_id_created_at_idx
  ON public.support_tickets (user_id, created_at DESC);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own support tickets" ON public.support_tickets;
CREATE POLICY "Users insert own support tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users select own support tickets" ON public.support_tickets;
CREATE POLICY "Users select own support tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
