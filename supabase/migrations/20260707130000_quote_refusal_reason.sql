-- Motif de refus d'un devis, saisi par le client depuis la page publique de signature.
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS refusal_reason text;
