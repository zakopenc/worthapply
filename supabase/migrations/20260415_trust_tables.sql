-- Add account_status to profiles
-- active: normal, flagged: admin-noted for review, suspended: blocked from app
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active'
    CHECK (account_status IN ('active', 'flagged', 'suspended'));

-- Partial index — only non-active accounts need fast lookup
CREATE INDEX IF NOT EXISTS profiles_account_status_idx
  ON profiles(account_status) WHERE account_status != 'active';

-- Privacy / GDPR requests table
CREATE TABLE IF NOT EXISTS privacy_requests (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email    TEXT NOT NULL, -- denormalized so it survives user deletion
  type          TEXT NOT NULL CHECK (type IN ('delete', 'export')),
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'complete', 'rejected')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  processed_at  TIMESTAMPTZ,
  processed_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE privacy_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS privacy_requests_status_idx     ON privacy_requests(status);
CREATE INDEX IF NOT EXISTS privacy_requests_user_id_idx    ON privacy_requests(user_id);
CREATE INDEX IF NOT EXISTS privacy_requests_created_at_idx ON privacy_requests(created_at DESC);
