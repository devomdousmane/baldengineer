import { notFound } from "next/navigation";
import { getInvoice } from "@/lib/actions/invoices";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceProfile } from "@/lib/workspace";
import { PrintDocument } from "@/components/modules/print-document";
import type { Profile } from "@/types/database";

export default async function FacturePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getWorkspaceProfile(supabase, user!.id);

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
        lines: (invoice.lines ?? []).map((l) => ({
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
