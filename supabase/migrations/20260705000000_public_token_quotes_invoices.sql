-- Permet au client destinataire d'un devis/facture de le consulter sans compte,
-- via un lien contenant un token unique non-devinable (envoyé par email).
ALTER TABLE quotes   ADD COLUMN public_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex');
ALTER TABLE invoices ADD COLUMN public_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex');

CREATE UNIQUE INDEX quotes_public_token_idx   ON quotes(public_token);
CREATE UNIQUE INDEX invoices_public_token_idx ON invoices(public_token);

-- Aucune policy RLS de lecture publique n'est ajoutée ici : la route
-- publique utilise le client service_role côté serveur pour résoudre le
-- document par token, RLS reste donc strictement limité à user_id = auth.uid()
-- pour tous les accès authentifiés classiques.
