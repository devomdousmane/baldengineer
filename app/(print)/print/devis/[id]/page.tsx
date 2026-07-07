import { notFound } from "next/navigation";
import { getQuote } from "@/lib/actions/quotes";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceProfile } from "@/lib/workspace";
import { PrintDocument } from "@/components/modules/print-document";
import type { Profile } from "@/types/database";

export default async function DevisPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getWorkspaceProfile(supabase, user!.id);

  return (
    <PrintDocument
      type="devis"
      document={{
        number: quote.number,
        title: quote.title,
        date: quote.date,
        dateLabel: "Date du devis",
        extraDate: quote.valid_until,
        extraDateLabel: "Valable jusqu'au",
        status: quote.status,
        market: quote.market,
        currency: quote.currency,
        subtotal_ht: quote.subtotal_ht,
        total_vat: quote.total_vat,
        total_ttc: quote.total_ttc,
        notes: quote.notes,
        terms: quote.terms,
        signedAt: quote.signed_at,
        signatureDataUrl: quote.signature_data_url,
        signerName: quote.signer_name,
        publicUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/view/devis/${quote.public_token}`,
        lines: (quote.lines ?? []).map((l) => ({
          position: l.position,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unit_price: l.unit_price,
          vat_rate: l.vat_rate,
          discount_pct: l.discount_pct,
        })),
      }}
      client={quote.client ?? null}
      profile={profile as Profile | null}
    />
  );
}
