-- Signature électronique : image de la signature de l'émetteur (réutilisée sur tous les
-- documents), et capture de la signature du client sur devis/facture via le lien public.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signature_data_url text;

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS signed_at            timestamptz;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS signature_data_url   text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS signer_name          text;

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS signed_at          timestamptz;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS signature_data_url text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS signer_name        text;
