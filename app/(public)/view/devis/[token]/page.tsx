import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PrintDocument } from "@/components/modules/print-document";
import { PublicSignatureBlock } from "@/components/modules/public-signature-block";
import type { Profile } from "@/types/database";

/**
 * Consultation publique d'un devis, sans authentification, via un token
 * unique non-devinable (envoyé par email au client). Utilise le client
 * service_role pour résoudre le document, indépendamment de toute session.
 */
export default async function DevisPublicPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, client:clients(*), lines:quote_lines(*)")
    .eq("public_token", token)
    .order("position", { referencedTable: "quote_lines" })
    .single();

  if (!quote) notFound();

  /* Sélection restreinte aux champs affichés sur le document — pas de full_name/email de compte/avatar */
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, company_address, company_city, company_zip, company_country, company_phone, company_email, company_website, company_siren, vat_number, company_nif, bank_name, bank_iban, bank_bic, legal_mention, signature_data_url")
    .eq("id", quote.user_id).single();

  return (
    <div>
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
          publicUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/view/devis/${token}`,
          lines: (quote.lines ?? []).map((l: { position: number; description: string; quantity: number; unit: string; unit_price: number; vat_rate: number; discount_pct: number }) => ({
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
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 pb-10 -mt-4 print:hidden">
        <PublicSignatureBlock
          type="devis"
          token={token}
          alreadySigned={!!quote.signed_at}
          signedAt={quote.signed_at}
          signerName={quote.signer_name}
          signatureDataUrl={quote.signature_data_url}
          defaultSignerName={quote.client?.name ?? ""}
          alreadyRefused={quote.status === "refused"}
          refusedAt={quote.refused_at}
          refusalReason={quote.refusal_reason}
        />
      </div>
    </div>
  );
}
