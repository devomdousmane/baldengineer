import { createClient } from "@/lib/supabase/server";
import { getClients } from "@/lib/actions/clients";
import { NewDevisForm } from "@/components/forms/new-devis-form";
import type { Market } from "@/types/database";

export default async function NewDevisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("default_market, vat_rate_default, company_name, full_name, company_address, company_city, company_zip, company_siren, company_nif, vat_number, company_email")
    .eq("id", user!.id)
    .single();

  const market = (profile?.default_market ?? "france") as Market;
  const vatRateDefault = profile?.vat_rate_default ?? 20;
  const clients = await getClients();

  return (
    <NewDevisForm
      clients={clients}
      defaultMarket={market}
      vatRateDefault={vatRateDefault}
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
      }}
    />
  );
}
