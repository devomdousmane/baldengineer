import { getMissions } from "@/lib/actions/missions";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { MissionsTable } from "@/components/tables/missions-table";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Market } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Créer une mission",
    body: "Client + taux journalier × jours estimés = budget calculé.",
  },
  {
    title: "Suivi",
    body: "Statut : En attente → Active → Terminée.",
  },
  {
    title: "Mission → Facture",
    body: "Facturez depuis la page Factures en liant le client de la mission.",
  },
];

export default async function MissionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles").select("default_market, currency_fr, currency_gn").eq("id", user!.id).single();

  const market = (profile?.default_market ?? "france") as Market;
  const currency = market === "france" ? (profile?.currency_fr ?? "EUR") : (profile?.currency_gn ?? "GNF");
  const missions = await getMissions(market);

  return (
    <>
      <Header
        title="Missions"
        subtitle={`${missions.length} mission${missions.length !== 1 ? "s" : ""} · ${market === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"}`}
        actions={
          <Link href="/missions/new">
            <Button size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />}>
              Nouvelle mission
            </Button>
          </Link>
        }
      />
      <PageWrapper
        aside={
          <PageAside
            title="Missions"
            description="Missions en régie ou forfait, liées à un client."
            tips={ASIDE_TIPS}
          />
        }
      >
        <MissionsTable missions={missions} currency={currency} />
      </PageWrapper>
    </>
  );
}
