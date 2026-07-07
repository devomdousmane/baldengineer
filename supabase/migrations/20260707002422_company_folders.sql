-- Sous-dossiers pour la bibliotheque de fichiers d'entreprise (arborescence a la Explorateur/Finder).
CREATE TABLE IF NOT EXISTS company_folders (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  market     market      NOT NULL,
  parent_id  uuid        REFERENCES company_folders(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS company_folders_user_market_idx ON company_folders (user_id, market);
CREATE INDEX IF NOT EXISTS company_folders_parent_idx      ON company_folders (parent_id);

ALTER TABLE company_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_company_folders" ON company_folders USING (user_id = auth.uid());

-- Rattachement d'un fichier a un dossier (NULL = racine).
ALTER TABLE company_files ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES company_folders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS company_files_folder_idx ON company_files (folder_id);
