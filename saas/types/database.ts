/* Auto-generated types — run `supabase gen types` to update */

export type Market = "france" | "guinee";
export type QuoteStatus = "draft" | "sent" | "accepted" | "refused" | "expired";
export type InvoiceStatus = "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled";
export type MissionStatus = "pending" | "active" | "completed" | "cancelled";
export type PaymentMethod = "virement" | "cheque" | "especes" | "carte" | "autre";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  company_siren: string | null;    /* France: SIREN/SIRET */
  company_nif: string | null;      /* Guinée: NIF */
  company_address: string | null;
  company_city: string | null;
  company_zip: string | null;
  company_country: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  default_market: Market;
  vat_number: string | null;       /* France: numéro TVA intracommunautaire */
  vat_rate_default: number;        /* 20.0 France, 0 Guinée */
  currency_fr: string;             /* EUR */
  currency_gn: string;             /* GNF */
  invoice_prefix_fr: string;       /* FAC-FR- */
  invoice_prefix_gn: string;       /* FAC-GN- */
  quote_prefix_fr: string;         /* DEV-FR- */
  quote_prefix_gn: string;         /* DEV-GN- */
  invoice_counter_fr: number;
  invoice_counter_gn: number;
  quote_counter_fr: number;
  quote_counter_gn: number;
  payment_terms_days: number;      /* 30 */
  bank_name: string | null;
  bank_iban: string | null;
  bank_bic: string | null;
  legal_mention: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  market: Market;
  type: "individual" | "company";
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string;
  siren: string | null;            /* France */
  nif: string | null;              /* Guinée */
  vat_number: string | null;       /* France */
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuoteLine {
  id: string;
  quote_id: string;
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
  discount_pct: number;
  total_ht: number;
  total_ttc: number;
}

export interface Quote {
  id: string;
  user_id: string;
  client_id: string;
  market: Market;
  number: string;
  status: QuoteStatus;
  title: string;
  date: string;
  valid_until: string;
  currency: string;
  subtotal_ht: number;
  total_vat: number;
  total_ttc: number;
  notes: string | null;
  terms: string | null;
  sent_at: string | null;
  accepted_at: string | null;
  refused_at: string | null;
  converted_to_invoice_id: string | null;
  created_at: string;
  updated_at: string;
  /* joins */
  client?: Client;
  lines?: QuoteLine[];
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
  discount_pct: number;
  total_ht: number;
  total_ttc: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  quote_id: string | null;
  market: Market;
  number: string;
  status: InvoiceStatus;
  title: string;
  date: string;
  due_date: string;
  currency: string;
  subtotal_ht: number;
  total_vat: number;
  total_ttc: number;
  paid_amount: number;
  notes: string | null;
  terms: string | null;
  payment_method: PaymentMethod | null;
  paid_at: string | null;
  sent_at: string | null;
  /* France e-invoicing */
  facturx_status: "none" | "pending" | "submitted" | "acknowledged" | "rejected" | null;
  facturx_id: string | null;
  chorus_pro_id: string | null;
  created_at: string;
  updated_at: string;
  /* joins */
  client?: Client;
  lines?: InvoiceLine[];
}

export interface Mission {
  id: string;
  user_id: string;
  client_id: string;
  market: Market;
  title: string;
  description: string | null;
  status: MissionStatus;
  start_date: string | null;
  end_date: string | null;
  daily_rate: number | null;
  estimated_days: number | null;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  /* joins */
  client?: Client;
}

export interface AccountingEntry {
  id: string;
  user_id: string;
  market: Market;
  type: "income" | "expense";
  category: string;
  label: string;
  amount: number;
  currency: string;
  date: string;
  invoice_id: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

/* ── Supabase Database shape (for typed client) ── */
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      clients: { Row: Client; Insert: Partial<Client>; Update: Partial<Client> };
      quotes: { Row: Quote; Insert: Partial<Quote>; Update: Partial<Quote> };
      quote_lines: { Row: QuoteLine; Insert: Partial<QuoteLine>; Update: Partial<QuoteLine> };
      invoices: { Row: Invoice; Insert: Partial<Invoice>; Update: Partial<Invoice> };
      invoice_lines: { Row: InvoiceLine; Insert: Partial<InvoiceLine>; Update: Partial<InvoiceLine> };
      missions: { Row: Mission; Insert: Partial<Mission>; Update: Partial<Mission> };
      accounting_entries: { Row: AccountingEntry; Insert: Partial<AccountingEntry>; Update: Partial<AccountingEntry> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      market: Market;
      quote_status: QuoteStatus;
      invoice_status: InvoiceStatus;
      mission_status: MissionStatus;
    };
  };
}
