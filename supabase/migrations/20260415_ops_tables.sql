-- Stripe webhook event log
-- Logs every incoming webhook for ops visibility and debugging
CREATE TABLE IF NOT EXISTS webhook_events (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id  TEXT NOT NULL UNIQUE,
  type             TEXT NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('processed', 'failed', 'ignored')),
  error_message    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS webhook_events_status_idx     ON webhook_events(status);
CREATE INDEX IF NOT EXISTS webhook_events_created_at_idx ON webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS webhook_events_type_idx       ON webhook_events(type);

-- AI error log
-- Logs AI generation failures by route for observability
CREATE TABLE IF NOT EXISTS ai_errors (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  route         TEXT NOT NULL,
  error_type    TEXT,
  error_message TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_errors ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS ai_errors_route_idx      ON ai_errors(route);
CREATE INDEX IF NOT EXISTS ai_errors_created_at_idx ON ai_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_errors_user_id_idx    ON ai_errors(user_id);
