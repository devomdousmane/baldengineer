import { getClients } from "@/lib/actions/clients";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { ClientsTable } from "@/components/tables/clients-table";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import { KpiCard } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Users, Building2, User, UserPlus } from "lucide-react";
import type { Market } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Ajouter un client",
    body: "Nom, marché (France/Guinée) puis coordonnées.",
  },
  {
    title: "France vs Guinée",
    body: "SIREN/TVA pour la France, NIF pour la Guinée — devise adaptée automatiquement.",
  },
  {
    title: "Changer de marché",
    body: "Le sélecteur de la barre latérale filtre les clients affichés.",
  },
];

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles").select("default_market").eq("id", user!.id).single();

  const market = (profile?.default_market ?? "france") as Market;
  const clients = await getClients(market);

  const companies = clients.filter((c) => c.type === "company").length;
  const individuals = clients.filter((c) => c.type === "individual").length;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const newThisMonth = clients.filter((c) => new Date(c.created_at) >= startOfMonth).length;

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
            description="Clients France et Guinée, liés à leurs devis et factures."
            tips={ASIDE_TIPS}
          />
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Total clients"
            value={String(clients.length)}
            icon={<Users className="w-4 h-4" />}
            accentColor="var(--color-accent)"
            index={0}
          />
          <KpiCard
            label="Entreprises"
            value={String(companies)}
            icon={<Building2 className="w-4 h-4" />}
            accentColor="var(--color-info)"
            index={1}
          />
          <KpiCard
            label="Particuliers"
            value={String(individuals)}
            icon={<User className="w-4 h-4" />}
            accentColor="var(--color-primary-2)"
            index={2}
          />
          <KpiCard
            label="Nouveaux ce mois"
            value={String(newThisMonth)}
            icon={<UserPlus className="w-4 h-4" />}
            accentColor="var(--color-success)"
            trend={newThisMonth > 0 ? "up" : "neutral"}
            index={3}
          />
        </div>
        <ClientsTable clients={clients} />
      </PageWrapper>
    </>
  );
}
