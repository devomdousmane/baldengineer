import { createClient } from "@/lib/supabase/server";
import { getClients } from "@/lib/actions/clients";
import { NewDevisForm } from "@/components/forms/new-devis-form";
import type { Market, Profile } from "@/types/database";

export default async function NewDevisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
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
      profile={profile as Profile | null}
    />
  );
}
