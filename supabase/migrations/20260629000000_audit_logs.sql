-- Audit trail for security-relevant events
CREATE TABLE IF NOT EXISTS audit_logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL    DEFAULT now(),
  user_id       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  action        text        NOT NULL,
  resource_id   text,
  resource_type text,
  ip            text,
  user_agent    text,
  metadata      jsonb
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx    ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx     ON audit_logs (action);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at DESC);

-- RLS: each user can only read their own audit trail
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- The edge function uses the service role key, so no INSERT policy needed for users
-- (service role bypasses RLS)

-- Optional: enable pg_cron-based 90-day retention
-- Activate pg_cron in Supabase Dashboard > Database > Extensions, then run:
-- SELECT cron.schedule('delete-old-audit-logs', '0 3 * * *',
--   $$DELETE FROM audit_logs WHERE created_at < now() - interval '90 days'$$);
