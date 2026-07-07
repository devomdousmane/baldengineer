-- Bibliotheque de fichiers d'entreprise (PDF, Word, Excel, images) filtrable par marche,
-- avec possibilite de lier un fichier a une ecriture comptable comme justificatif (scan de facture).
CREATE TABLE IF NOT EXISTS company_files (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  market       market      NOT NULL,
  storage_path text        NOT NULL,
  file_name    text        NOT NULL,
  file_type    text        NOT NULL,
  size_bytes   bigint      NOT NULL,
  category     text        NOT NULL DEFAULT 'autre',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS company_files_user_market_idx ON company_files (user_id, market);
CREATE INDEX IF NOT EXISTS company_files_created_at_idx  ON company_files (created_at DESC);

ALTER TABLE company_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_company_files" ON company_files USING (user_id = auth.uid());

-- Justificatif (facture scannee) lie a une ecriture comptable.
ALTER TABLE accounting_entries ADD COLUMN IF NOT EXISTS receipt_file_id uuid REFERENCES company_files(id) ON DELETE SET NULL;

-- Bucket de stockage prive : chaque fichier est range sous {user_id}/{filename},
-- les policies restreignent l'acces au proprietaire du dossier.
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-files', 'company-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "own_company_files_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "own_company_files_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'company-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "own_company_files_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'company-files' AND (storage.foldername(name))[1] = auth.uid()::text);
