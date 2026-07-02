export interface FacturXLine {
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
  discount_pct: number;
  total_ht: number;
}

export interface FacturXSeller {
  name: string;
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string;
  vat_number: string | null;
  siren: string | null;
  email: string | null;
  iban: string | null;
  bic: string | null;
  bank_name: string | null;
}

export interface FacturXBuyer {
  name: string;
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string;
  vat_number: string | null;
  siren: string | null;
}

export interface FacturXInvoice {
  number: string;
  date: string;
  due_date: string;
  currency: string;
  notes: string | null;
  subtotal_ht: number;
  total_vat: number;
  total_ttc: number;
  paid_amount: number;
  lines: FacturXLine[];
}

export interface FacturXData {
  invoice: FacturXInvoice;
  seller: FacturXSeller;
  buyer: FacturXBuyer;
}
