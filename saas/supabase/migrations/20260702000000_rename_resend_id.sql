-- Migration de fournisseur email (Resend → Plunk) : renommer la colonne pour rester neutre au provider
ALTER TABLE email_logs RENAME COLUMN resend_id TO provider_message_id;
