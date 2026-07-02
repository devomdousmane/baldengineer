import { createClient } from "@/lib/supabase/server";
import { getClients } from "@/lib/actions/clients";
import { NewFactureForm } from "@/components/forms/new-facture-form";
import { Header } from "@/components/layout/header";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Market } from "@/types/database";

export default async function NewFacturePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("default_market, vat_rate_default, payment_terms_days, company_name, full_name, company_address, company_city, company_zip, company_siren, company_nif, vat_number, company_email, bank_iban, bank_bic, bank_name")
    .eq("id", user!.id)
    .single();

  const market = (profile?.default_market ?? "france") as Market;
  const vatRateDefault = profile?.vat_rate_default ?? 20;
  const paymentTermsDays = profile?.payment_terms_days ?? 30;
  const clients = await getClients();

  return (
    <>
      <Header
        title="Nouvelle facture"
        subtitle="Créez une facture pour un client"
        actions={
          <Link href="/factures">
            <Button variant="ghost" size="sm" iconLeft={<ArrowLeft className="w-3.5 h-3.5" />}>
              Retour
            </Button>
          </Link>
        }
      />
      <PageWrapper>
        <NewFactureForm
          clients={clients}
          defaultMarket={market}
          vatRateDefault={vatRateDefault}
          paymentTermsDays={paymentTermsDays}
          previewProfile={{
            company_name: profile?.company_name,
            full_name: profile?.full_name,
            company_address: profile?.company_address,
            company_city: profile?.company_city,
            company_zip: profile?.company_zip,
            company_siren: profile?.company_siren,
            company_nif: profile?.company_nif,
            vat_number: profile?.vat_number,
            company_email: profile?.company_email,
            bank_iban: profile?.bank_iban,
            bank_bic: profile?.bank_bic,
            bank_name: profile?.bank_name,
          }}
        />
      </PageWrapper>
    </>
  );
}
