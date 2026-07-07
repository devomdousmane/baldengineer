import { createClient } from "@/lib/supabase/server";
import { getWorkspaceProfile } from "@/lib/workspace";
import { getClients } from "@/lib/actions/clients";
import { NewFactureForm } from "@/components/forms/new-facture-form";
import type { Market, Profile } from "@/types/database";

export default async function NewFacturePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getWorkspaceProfile(supabase, user!.id);

  const market = (profile?.default_market ?? "france") as Market;
  const vatRateDefault = profile?.vat_rate_default ?? 20;
  const paymentTermsDays = profile?.payment_terms_days ?? 30;
  const clients = await getClients();

  return (
    <NewFactureForm
      clients={clients}
      defaultMarket={market}
      vatRateDefault={vatRateDefault}
      paymentTermsDays={paymentTermsDays}
      profile={profile as Profile | null}
    />
  );
}
