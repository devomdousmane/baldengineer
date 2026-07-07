import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { ComptabiliteTable } from "@/components/tables/comptabilite-table";
import { CashflowChart } from "@/components/modules/cashflow-chart";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/ui/kpi-card";
import Link from "next/link";
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { AccountingEntry, Market } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Ajouter une écriture",
    body: "Cliquez sur « Nouvelle écriture ». Choisissez Recette ou Dépense, sélectionnez la catégorie, saisissez le montant et la date.",
  },
  {
    title: "Écritures automatiques",
    body: "Chaque paiement enregistré sur une facture crée automatiquement une écriture comptable de type « Recette – Facturation ».",
  },
  {
    title: "Catégories",
    body: "Les recettes couvrent facturation, prestations, remboursements. Les dépenses couvrent matériel, logiciels, déplacements, assurance, etc.",
  },
  {
    title: "Solde net",
    body: "Le solde affiché en en-tête est la différence entre toutes les recettes et toutes les dépenses du marché actif.",
  },
];

export default async function ComptabilitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles").select("default_market, currency_fr, currency_gn").eq("id", user!.id).single();

  const market = (profile?.default_market ?? "france") as Market;
  const currency = market === "france" ? (profile?.currency_fr ?? "EUR") : (profile?.currency_gn ?? "GNF");

  const { data: entries } = await supabase
    .from("accounting_entries")
    .select("*")
    .eq("user_id", user!.id)
    .eq("market", market)
    .order("date", { ascending: false });

  const rows = (entries ?? []) as AccountingEntry[];
  const totalIncome = rows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const totalExpense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
  const solde = totalIncome - totalExpense;

  /* Agrégation mensuelle pour le rapport annuel */
  const year = new Date().getFullYear();
  const byMonth = new Map<string, { income: number; expense: number }>();
  for (const r of rows) {
    const month = String(r.date).slice(0, 7);
    if (!month.startsWith(String(year))) continue;
    const agg = byMonth.get(month) ?? { income: 0, expense: 0 };
    if (r.type === "income") agg.income += r.amount;
    else agg.expense += r.amount;
    byMonth.set(month, agg);
  }
  const cashflow = Array.from(byMonth.entries()).map(([month, v]) => ({ month, ...v }));

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  return (
    <>
      <Header
        title="Comptabilité"
        subtitle={`Solde : ${fmt(solde)} · ${market === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"}`}
        actions={
          <Link href="/comptabilite/new">
            <Button size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />}>
              Nouvelle écriture
            </Button>
          </Link>
        }
      />
      <PageWrapper
        aside={
          <PageAside
            title="Comptabilité"
            description="Suivez vos recettes et dépenses. Les écritures liées aux factures sont créées automatiquement."
            tips={ASIDE_TIPS}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Recettes"
            value={fmt(totalIncome)}
            icon={<TrendingUp className="w-4 h-4" />}
            accentColor="var(--color-success)"
            index={0}
          />
          <KpiCard
            label="Dépenses"
            value={fmt(totalExpense)}
            icon={<TrendingDown className="w-4 h-4" />}
            accentColor="var(--color-danger)"
            index={1}
          />
          <KpiCard
            label="Solde net"
            value={fmt(solde)}
            icon={<Wallet className="w-4 h-4" />}
            accentColor={solde >= 0 ? "var(--color-success)" : "var(--color-danger)"}
            trend={solde >= 0 ? "up" : "down"}
            trendValue={solde >= 0 ? "Excédent" : "Déficit"}
            index={2}
          />
        </div>
        <CashflowChart data={cashflow} year={year} currency={currency} />
        <ComptabiliteTable entries={rows} currency={currency} />
      </PageWrapper>
    </>
  );
}
