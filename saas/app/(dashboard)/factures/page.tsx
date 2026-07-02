import { getInvoices } from "@/lib/actions/invoices";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { FacturesTable } from "@/components/tables/factures-table";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Market } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Créer une facture",
    body: "Cliquez sur « Nouvelle facture » ou convertissez directement un devis accepté. Les lignes sont préremplies automatiquement.",
  },
  {
    title: "Enregistrer un paiement",
    body: "Ouvrez une facture envoyée et cliquez sur « Enregistrer paiement ». Indiquez le montant reçu et le mode de paiement. L'écriture comptable est créée automatiquement.",
  },
  {
    title: "Factures en retard",
    body: "Les factures dont la date d'échéance est dépassée passent en statut « En retard » et apparaissent en rouge. Pensez à relancer vos clients.",
  },
  {
    title: "Factur-X (France)",
    body: "Pour les clients France, soumettez vos factures au format Factur-X via le bouton dédié sur la page de détail. Nécessite les credentials Chorus Pro.",
  },
];

export default async function FacturesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles").select("default_market, currency_fr, currency_gn").eq("id", user!.id).single();

  const market = (profile?.default_market ?? "france") as Market;
  const currency = market === "france" ? (profile?.currency_fr ?? "EUR") : (profile?.currency_gn ?? "GNF");
  const invoices = await getInvoices(market);

  return (
    <>
      <Header
        title="Factures"
        subtitle={`${invoices.length} facture${invoices.length !== 1 ? "s" : ""} · ${market === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"}`}
        actions={
          <Link href="/factures/new">
            <Button size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />}>
              Nouvelle facture
            </Button>
          </Link>
        }
      />
      <PageWrapper
        aside={
          <PageAside
            title="Facturation"
            description="Gérez tout votre cycle de facturation : de l'émission au paiement, en passant par les relances."
            tips={ASIDE_TIPS}
          />
        }
      >
        <FacturesTable invoices={invoices} currency={currency} />
      </PageWrapper>
    </>
  );
}
