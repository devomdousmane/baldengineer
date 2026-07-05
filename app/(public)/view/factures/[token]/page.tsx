import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PrintDocument } from "@/components/modules/print-document";
import type { Profile } from "@/types/database";

/**
 * Consultation publique d'une facture, sans authentification, via un token
 * unique non-devinable (envoyé par email au client). Utilise le client
 * service_role pour résoudre le document, indépendamment de toute session.
 */
export default async function FacturePublicPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, client:clients(*), lines:invoice_lines(*)")
    .eq("public_token", token)
    .order("position", { referencedTable: "invoice_lines" })
    .single();

  if (!invoice) notFound();

  /* Sélection restreinte aux champs affichés sur le document — pas de full_name/email de compte/avatar */
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, company_address, company_city, company_zip, company_country, company_phone, company_email, company_website, company_siren, vat_number, company_nif, bank_name, bank_iban, bank_bic, legal_mention")
    .eq("id", invoice.user_id).single();

  return (
    <PrintDocument
      type="facture"
      document={{
        number: invoice.number,
        title: invoice.title,
        date: invoice.date,
        dateLabel: "Date de facturation",
        extraDate: invoice.due_date,
        extraDateLabel: "Date d'échéance",
        status: invoice.status,
        market: invoice.market,
        currency: invoice.currency,
        subtotal_ht: invoice.subtotal_ht,
        total_vat: invoice.total_vat,
        total_ttc: invoice.total_ttc,
        paid_amount: invoice.paid_amount,
        payment_method: invoice.payment_method,
        paid_at: invoice.paid_at,
        notes: invoice.notes,
        terms: invoice.terms,
        lines: (invoice.lines ?? []).map((l: { position: number; description: string; quantity: number; unit: string; unit_price: number; vat_rate: number; discount_pct: number }) => ({
          position: l.position,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unit_price: l.unit_price,
          vat_rate: l.vat_rate,
          discount_pct: l.discount_pct,
        })),
      }}
      client={invoice.client ?? null}
      profile={profile as Profile | null}
    />
  );
}
