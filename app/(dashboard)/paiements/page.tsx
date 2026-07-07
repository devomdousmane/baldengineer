import { getInvoices } from "@/lib/actions/invoices";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceProfile } from "@/lib/workspace";
import { Header } from "@/components/layout/header";
import { PaymentsTable } from "@/components/tables/payments-table";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import { KpiCard } from "@/components/ui/kpi-card";
import { Wallet, TrendingUp, AlertTriangle, Receipt } from "lucide-react";
import type { Market, InvoiceStatus } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Suivre les encaissements",
    body: "Cette page regroupe toutes vos factures avec leur statut de paiement. Le montant « Payé » se met à jour dès qu'un paiement est enregistré sur une facture.",
  },
  {
    title: "Factures en retard",
    body: "Les factures dont la date d'échéance est dépassée passent automatiquement en « En retard » et apparaissent en rouge. Pensez à relancer vos clients.",
  },
  {
    title: "Enregistrer un paiement",
    body: "Ouvrez une facture puis cliquez sur « Enregistrer paiement ». L'écriture comptable correspondante est créée automatiquement.",
  },
];

export default async function PaiementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getWorkspaceProfile(supabase, user!.id);

  const market = (profile?.default_market ?? "france") as Market;
  const currency = market === "france" ? (profile?.currency_fr ?? "EUR") : (profile?.currency_gn ?? "GNF");
  const invoices = await getInvoices(market);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  const encaisse = invoices
    .filter((i) => i.status === "paid" || i.status === "partial")
    .reduce((s, i) => s + i.paid_amount, 0);

  const aEncaisser = invoices
    .filter((i) => i.status !== "paid" && i.status !== "cancelled" && i.status !== "draft")
    .reduce((s, i) => s + (i.total_ttc - i.paid_amount), 0);

  const enRetard = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + (i.total_ttc - i.paid_amount), 0);

  const byStatus = invoices.reduce<Record<InvoiceStatus, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {} as Record<InvoiceStatus, number>);

  return (
    <>
      <Header
        title="Paiements"
        subtitle={`${invoices.length} facture${invoices.length !== 1 ? "s" : ""} · ${market === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"}`}
      />
      <PageWrapper
        aside={
          <PageAside
            title="Encaissements"
            description="Suivez l'avancement de vos paiements clients et repérez rapidement les retards."
            tips={ASIDE_TIPS}
          />
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Encaissé"
            value={fmt(encaisse)}
            subtitle="Payé + partiels"
            icon={<Wallet className="w-4 h-4" />}
            accentColor="var(--color-success)"
            index={0}
          />
          <KpiCard
            label="À encaisser"
            value={fmt(aEncaisser)}
            subtitle="Factures envoyées"
            icon={<TrendingUp className="w-4 h-4" />}
            accentColor="var(--color-accent)"
            index={1}
          />
          <KpiCard
            label="En retard"
            value={fmt(enRetard)}
            subtitle={`${byStatus.overdue ?? 0} facture${(byStatus.overdue ?? 0) !== 1 ? "s" : ""}`}
            icon={<AlertTriangle className="w-4 h-4" />}
            accentColor="var(--color-danger)"
            trend={enRetard > 0 ? "down" : "neutral"}
            index={2}
          />
          <KpiCard
            label="Factures totales"
            value={String(invoices.length)}
            subtitle={`${byStatus.paid ?? 0} payées · ${byStatus.sent ?? 0} en attente`}
            icon={<Receipt className="w-4 h-4" />}
            accentColor="var(--color-primary)"
            index={3}
          />
        </div>

        <PaymentsTable invoices={invoices} currency={currency} />
      </PageWrapper>
    </>
  );
}
