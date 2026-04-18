-- Admin roles table
-- No RLS policies = service_role only access (secure by default)
CREATE TABLE IF NOT EXISTS admin_roles (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'support')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  UUID REFERENCES auth.users(id),
  UNIQUE(user_id)
);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Admin audit log table
-- No RLS policies = service_role only access
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id        UUID NOT NULL REFERENCES auth.users(id),
  target_user_id  UUID REFERENCES auth.users(id),
  action          TEXT NOT NULL,
  diff            JSONB,
  reason          TEXT,
  ip              TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS admin_audit_log_admin_id_idx       ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_target_user_id_idx ON admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx     ON admin_audit_log(created_at DESC);

-- Seed first admin owner
INSERT INTO admin_roles (user_id, role)
SELECT id, 'owner'
FROM auth.users
WHERE email = 'abdelboch@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
