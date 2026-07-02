-- ═══════════════════════════════════════════════════════════════
-- BaldPro SaaS — Supabase Schema
-- ═══════════════════════════════════════════════════════════════

/* ── Types ── */
CREATE TYPE market         AS ENUM ('france', 'guinee');
CREATE TYPE quote_status   AS ENUM ('draft', 'sent', 'accepted', 'refused', 'expired');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled');
CREATE TYPE mission_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('virement', 'cheque', 'especes', 'carte', 'autre');
CREATE TYPE facturx_status AS ENUM ('none', 'pending', 'submitted', 'acknowledged', 'rejected');

/* ── Profiles ── */
CREATE TABLE profiles (
  id                  UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email               TEXT NOT NULL,
  full_name           TEXT,
  avatar_url          TEXT,
  company_name        TEXT,
  company_siren       TEXT,
  company_nif         TEXT,
  company_address     TEXT,
  company_city        TEXT,
  company_zip         TEXT,
  company_country     TEXT DEFAULT 'France',
  company_phone       TEXT,
  company_email       TEXT,
  company_website     TEXT,
  default_market      market NOT NULL DEFAULT 'france',
  vat_number          TEXT,
  vat_rate_default    NUMERIC(5,2) NOT NULL DEFAULT 20.0,
  currency_fr         TEXT NOT NULL DEFAULT 'EUR',
  currency_gn         TEXT NOT NULL DEFAULT 'GNF',
  invoice_prefix_fr   TEXT NOT NULL DEFAULT 'FAC-FR-',
  invoice_prefix_gn   TEXT NOT NULL DEFAULT 'FAC-GN-',
  quote_prefix_fr     TEXT NOT NULL DEFAULT 'DEV-FR-',
  quote_prefix_gn     TEXT NOT NULL DEFAULT 'DEV-GN-',
  invoice_counter_fr  INTEGER NOT NULL DEFAULT 1,
  invoice_counter_gn  INTEGER NOT NULL DEFAULT 1,
  quote_counter_fr    INTEGER NOT NULL DEFAULT 1,
  quote_counter_gn    INTEGER NOT NULL DEFAULT 1,
  payment_terms_days  INTEGER NOT NULL DEFAULT 30,
  bank_name           TEXT,
  bank_iban           TEXT,
  bank_bic            TEXT,
  legal_mention       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* ── Clients ── */
CREATE TABLE clients (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  market      market NOT NULL DEFAULT 'france',
  type        TEXT NOT NULL DEFAULT 'company' CHECK (type IN ('individual', 'company')),
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  city        TEXT,
  zip         TEXT,
  country     TEXT NOT NULL DEFAULT 'France',
  siren       TEXT,
  nif         TEXT,
  vat_number  TEXT,
  notes       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* ── Quotes (sans FK vers invoices — ajoutée plus bas) ── */
CREATE TABLE quotes (
  id                       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id                UUID REFERENCES clients(id) ON DELETE RESTRICT NOT NULL,
  market                   market NOT NULL,
  number                   TEXT NOT NULL,
  status                   quote_status NOT NULL DEFAULT 'draft',
  title                    TEXT NOT NULL,
  date                     DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until              DATE NOT NULL,
  currency                 TEXT NOT NULL DEFAULT 'EUR',
  subtotal_ht              NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_vat                NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_ttc                NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes                    TEXT,
  terms                    TEXT,
  sent_at                  TIMESTAMPTZ,
  accepted_at              TIMESTAMPTZ,
  refused_at               TIMESTAMPTZ,
  converted_to_invoice_id  UUID,  -- FK ajoutée après création de invoices
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, number)
);

/* ── Quote Lines ── */
CREATE TABLE quote_lines (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id      UUID REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  position      INTEGER NOT NULL DEFAULT 1,
  description   TEXT NOT NULL,
  quantity      NUMERIC(10,3) NOT NULL DEFAULT 1,
  unit          TEXT NOT NULL DEFAULT 'forfait',
  unit_price    NUMERIC(15,2) NOT NULL DEFAULT 0,
  vat_rate      NUMERIC(5,2) NOT NULL DEFAULT 20.0,
  discount_pct  NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_ht      NUMERIC(15,2) GENERATED ALWAYS AS (
    ROUND(quantity * unit_price * (1 - discount_pct / 100), 2)
  ) STORED,
  total_ttc     NUMERIC(15,2) GENERATED ALWAYS AS (
    ROUND(quantity * unit_price * (1 - discount_pct / 100) * (1 + vat_rate / 100), 2)
  ) STORED
);

/* ── Invoices ── */
CREATE TABLE invoices (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id        UUID REFERENCES clients(id) ON DELETE RESTRICT NOT NULL,
  quote_id         UUID REFERENCES quotes(id),
  market           market NOT NULL,
  number           TEXT NOT NULL,
  status           invoice_status NOT NULL DEFAULT 'draft',
  title            TEXT NOT NULL,
  date             DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date         DATE NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'EUR',
  subtotal_ht      NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_vat        NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_ttc        NUMERIC(15,2) NOT NULL DEFAULT 0,
  paid_amount      NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  terms            TEXT,
  payment_method   payment_method,
  paid_at          TIMESTAMPTZ,
  sent_at          TIMESTAMPTZ,
  facturx_status   facturx_status DEFAULT 'none',
  facturx_id       TEXT,
  chorus_pro_id    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, number)
);

/* ── FK circulaire quotes → invoices (après création de invoices) ── */
ALTER TABLE quotes
  ADD CONSTRAINT fk_quotes_invoice
  FOREIGN KEY (converted_to_invoice_id) REFERENCES invoices(id);

/* ── Invoice Lines ── */
CREATE TABLE invoice_lines (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id    UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  position      INTEGER NOT NULL DEFAULT 1,
  description   TEXT NOT NULL,
  quantity      NUMERIC(10,3) NOT NULL DEFAULT 1,
  unit          TEXT NOT NULL DEFAULT 'forfait',
  unit_price    NUMERIC(15,2) NOT NULL DEFAULT 0,
  vat_rate      NUMERIC(5,2) NOT NULL DEFAULT 20.0,
  discount_pct  NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_ht      NUMERIC(15,2) GENERATED ALWAYS AS (
    ROUND(quantity * unit_price * (1 - discount_pct / 100), 2)
  ) STORED,
  total_ttc     NUMERIC(15,2) GENERATED ALWAYS AS (
    ROUND(quantity * unit_price * (1 - discount_pct / 100) * (1 + vat_rate / 100), 2)
  ) STORED
);

/* ── Missions ── */
CREATE TABLE missions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id       UUID REFERENCES clients(id) ON DELETE RESTRICT NOT NULL,
  market          market NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  status          mission_status NOT NULL DEFAULT 'pending',
  start_date      DATE,
  end_date        DATE,
  daily_rate      NUMERIC(10,2),
  estimated_days  NUMERIC(8,2),
  currency        TEXT NOT NULL DEFAULT 'EUR',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* ── Accounting ── */
CREATE TABLE accounting_entries (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  market      market NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category    TEXT NOT NULL,
  label       TEXT NOT NULL,
  amount      NUMERIC(15,2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'EUR',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  invoice_id  UUID REFERENCES invoices(id),
  reference   TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* ── RLS ── */
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients            ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_lines        ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices           ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines      ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile"       ON profiles           USING (id = auth.uid());
CREATE POLICY "own_clients"       ON clients            USING (user_id = auth.uid());
CREATE POLICY "own_quotes"        ON quotes             USING (user_id = auth.uid());
CREATE POLICY "own_quote_lines"   ON quote_lines        USING (quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid()));
CREATE POLICY "own_invoices"      ON invoices           USING (user_id = auth.uid());
CREATE POLICY "own_invoice_lines" ON invoice_lines      USING (invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid()));
CREATE POLICY "own_missions"      ON missions           USING (user_id = auth.uid());
CREATE POLICY "own_accounting"    ON accounting_entries USING (user_id = auth.uid());

/* ── Trigger: profil auto à l'inscription ── */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

/* ── Trigger: updated_at automatique ── */
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER t_profiles  BEFORE UPDATE ON profiles  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t_clients   BEFORE UPDATE ON clients   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t_quotes    BEFORE UPDATE ON quotes    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t_invoices  BEFORE UPDATE ON invoices  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t_missions  BEFORE UPDATE ON missions  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

/* ── Indexes ── */
CREATE INDEX idx_clients_user_market  ON clients            (user_id, market);
CREATE INDEX idx_quotes_user_status   ON quotes             (user_id, status);
CREATE INDEX idx_invoices_user_status ON invoices           (user_id, status);
CREATE INDEX idx_invoices_due_date    ON invoices           (due_date) WHERE status NOT IN ('paid', 'cancelled');
CREATE INDEX idx_missions_user_status ON missions           (user_id, status);
CREATE INDEX idx_accounting_user_date ON accounting_entries (user_id, date);
