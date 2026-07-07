import { getInvoices } from "@/lib/actions/invoices";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { FacturesTable } from "@/components/tables/factures-table";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import { KpiCard } from "@/components/ui/kpi-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Wallet, AlertTriangle, FileStack } from "lucide-react";
import type { Market } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Créer une facture",
    body: "Depuis un devis accepté ou directement via « Nouvelle facture ».",
  },
  {
    title: "Paiement",
    body: "Ouvrez la facture → « Enregistrer paiement ». L'écriture comptable est créée automatiquement.",
  },
  {
    title: "Factur-X",
    body: "Clients France : soumission Chorus Pro depuis la page de détail.",
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

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  const totalFacture = invoices
    .filter((i) => i.status !== "cancelled")
    .reduce((s, i) => s + i.total_ttc, 0);

  const totalEncaisse = invoices.reduce((s, i) => s + i.paid_amount, 0);

  const enRetard = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + (i.total_ttc - i.paid_amount), 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

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
            description="Du devis au paiement, avec relances."
            tips={ASIDE_TIPS}
          />
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Total facturé"
            value={fmt(totalFacture)}
            subtitle="Hors annulées"
            icon={<FileStack className="w-4 h-4" />}
            accentColor="var(--color-primary)"
            index={0}
          />
          <KpiCard
            label="Encaissé"
            value={fmt(totalEncaisse)}
            icon={<Wallet className="w-4 h-4" />}
            accentColor="var(--color-success)"
            index={1}
          />
          <KpiCard
            label="En retard"
            value={fmt(enRetard)}
            subtitle={`${overdueCount} facture${overdueCount !== 1 ? "s" : ""}`}
            icon={<AlertTriangle className="w-4 h-4" />}
            accentColor="var(--color-danger)"
            trend={overdueCount > 0 ? "down" : "neutral"}
            index={2}
          />
          <KpiCard
            label="Total factures"
            value={String(invoices.length)}
            icon={<Receipt className="w-4 h-4" />}
            accentColor="var(--color-accent)"
            index={3}
          />
        </div>
        <FacturesTable invoices={invoices} currency={currency} />
      </PageWrapper>
    </>
  );
}
