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
    body: "Cliquez sur « Nouvelle mission ». Associez-la à un client, définissez un taux journalier et un nombre de jours estimés pour calculer le budget automatiquement.",
  },
  {
    title: "Suivre l'avancement",
    body: "Changez le statut de la mission : En attente → Active → Terminée. Cela vous permet de suivre ce qui est en cours et ce qui est livré.",
  },
  {
    title: "Budget estimé",
    body: "Le champ « Jours estimés × Taux journalier » calcule le montant prévisionnel. Utilisez-le pour préparer vos devis.",
  },
  {
    title: "Mission → Facture",
    body: "Une fois la mission terminée, créez une facture directement depuis la page Factures en y liant la mission via le champ client.",
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
            description="Suivez vos missions en régie ou forfait. Associez chaque mission à un client et calculez votre budget prévisionnel."
            tips={ASIDE_TIPS}
          />
        }
      >
        <MissionsTable missions={missions} currency={currency} />
      </PageWrapper>
    </>
  );
}
