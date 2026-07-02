import { getQuotes } from "@/lib/actions/quotes";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { DevisTable } from "@/components/tables/devis-table";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Market } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Créer un devis",
    body: "Cliquez sur « Nouveau devis ». Sélectionnez un client, ajoutez des lignes (description, quantité, prix unitaire, TVA) et définissez la date de validité.",
  },
  {
    title: "Cycle de vie",
    body: "Brouillon → Envoyé → Accepté → Converti en facture. Ou Refusé / Expiré si le client ne répond pas avant la date limite.",
  },
  {
    title: "Convertir en facture",
    body: "Ouvrez un devis accepté et cliquez sur « Convertir en facture ». Toutes les lignes sont reprises automatiquement.",
  },
  {
    title: "Imprimer / PDF",
    body: "Depuis la page de détail du devis, cliquez sur « Imprimer / PDF » pour générer un document A4 professionnel avec votre logo et mentions légales.",
  },
];

export default async function DevisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles").select("default_market, currency_fr, currency_gn").eq("id", user!.id).single();

  const market = (profile?.default_market ?? "france") as Market;
  const currency = market === "france" ? (profile?.currency_fr ?? "EUR") : (profile?.currency_gn ?? "GNF");
  const quotes = await getQuotes(market);

  return (
    <>
      <Header
        title="Devis"
        subtitle={`${quotes.length} devis · ${market === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"}`}
        actions={
          <Link href="/devis/new">
            <Button size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />}>
              Nouveau devis
            </Button>
          </Link>
        }
      />
      <PageWrapper
        aside={
          <PageAside
            title="Devis"
            description="Créez et suivez vos propositions commerciales. Un devis accepté se convertit en facture en un clic."
            tips={ASIDE_TIPS}
          />
        }
      >
        <DevisTable quotes={quotes} currency={currency} />
      </PageWrapper>
    </>
  );
}
