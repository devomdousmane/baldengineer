import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { ComptabiliteTable } from "@/components/tables/comptabilite-table";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
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

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  const kpis = [
    { label: "Recettes", value: totalIncome, color: "var(--color-success)", bg: "var(--color-success-dim)", icon: TrendingUp },
    { label: "Dépenses", value: totalExpense, color: "var(--color-danger)", bg: "var(--color-danger-dim)", icon: TrendingDown },
    { label: "Solde net", value: solde, color: solde >= 0 ? "var(--color-success)" : "var(--color-danger)", bg: solde >= 0 ? "var(--color-success-dim)" : "var(--color-danger-dim)", icon: Minus },
  ];

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
          {kpis.map(({ label, value, color, bg, icon: Icon }) => (
            <div
              key={label}
              className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-sm)] flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-2)] mb-0.5">{label}</p>
                <p className="text-xl font-heading font-semibold tabular-nums" style={{ color }}>{fmt(value)}</p>
              </div>
            </div>
          ))}
        </div>
        <ComptabiliteTable entries={rows} currency={currency} />
      </PageWrapper>
    </>
  );
}
