-- Email delivery log
CREATE TABLE IF NOT EXISTS email_logs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type           text NOT NULL,          -- devis_envoye, facture_envoyee, relance_paiement_1, etc.
  to_email       text NOT NULL,
  cc_email       text,
  subject        text NOT NULL,
  resource_id    text,                   -- quote.id or invoice.id or mission.id
  resource_type  text,                   -- 'quote' | 'invoice' | 'mission'
  status         text NOT NULL DEFAULT 'sent',  -- sent | failed | delivered | bounced
  resend_id      text,                   -- Resend message ID for delivery tracking
  error_message  text,
  metadata       jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS email_logs_user_id_idx      ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS email_logs_resource_idx     ON email_logs(resource_id, resource_type);
CREATE INDEX IF NOT EXISTS email_logs_created_at_idx   ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS email_logs_type_idx         ON email_logs(type);

-- RLS: user sees own logs only
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own email logs"
  ON email_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own email logs"
  ON email_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
