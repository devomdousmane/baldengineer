-- Mesure d'audience anonyme du site vitrine (pas d'IP stockee, pas de cookie identifiant)
CREATE TABLE IF NOT EXISTS site_visits (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL    DEFAULT now(),
  path       text        NOT NULL,
  referrer   text,
  country    text,
  region     text,
  city       text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS site_visits_created_at_idx ON site_visits (created_at DESC);
CREATE INDEX IF NOT EXISTS site_visits_path_idx       ON site_visits (path);
CREATE INDEX IF NOT EXISTS site_visits_country_idx    ON site_visits (country);

-- RLS activee, aucune policy : ni lecture ni ecriture cote client.
-- L'edge function track-visit ecrit via service_role (bypass RLS).
-- Le dashboard SaaS lit via createAdminClient() (service_role, bypass RLS).
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Retention optionnelle (12 mois), a activer via pg_cron si souhaite :
-- SELECT cron.schedule('delete-old-site-visits', '0 4 * * *',
--   $$DELETE FROM site_visits WHERE created_at < now() - interval '365 days'$$);
