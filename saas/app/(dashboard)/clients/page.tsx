import { getClients } from "@/lib/actions/clients";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { ClientsTable } from "@/components/tables/clients-table";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Market } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Ajouter un client",
    body: "Cliquez sur « Nouveau client » en haut à droite. Renseignez le nom, le marché (France ou Guinée), puis les coordonnées.",
  },
  {
    title: "France vs Guinée",
    body: "Un client France utilise SIREN / TVA intracommunautaire. Un client Guinée utilise le NIF. Les documents sont générés dans la bonne devise automatiquement.",
  },
  {
    title: "Recherche et vues",
    body: "Utilisez la barre de recherche pour filtrer par nom. Basculez entre vue tableau, grille et liste avec les icônes en haut à droite de la liste.",
  },
  {
    title: "Changer de marché",
    body: "Le sélecteur dans la barre latérale filtre les clients affichés. Passez de 🇫🇷 France à 🇬🇳 Guinée en un clic.",
  },
];

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles").select("default_market").eq("id", user!.id).single();

  const market = (profile?.default_market ?? "france") as Market;
  const clients = await getClients(market);

  return (
    <>
      <Header
        title="Clients"
        subtitle={`${clients.length} client${clients.length !== 1 ? "s" : ""} · ${market === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"}`}
        actions={
          <Link href="/clients/new">
            <Button size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />}>
              Nouveau client
            </Button>
          </Link>
        }
      />
      <PageWrapper
        aside={
          <PageAside
            title="Gestion clients"
            description="Centralisez tous vos clients France et Guinée. Chaque client est lié à ses devis, factures et missions."
            tips={ASIDE_TIPS}
          />
        }
      >
        <ClientsTable clients={clients} />
      </PageWrapper>
    </>
  );
}
