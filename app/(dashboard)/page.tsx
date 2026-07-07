import { Header } from "@/components/layout/header";
import { RevenueChart } from "@/components/modules/revenue-chart";
import { InvoiceStatusChart, type StatusBreakdownItem } from "@/components/modules/invoice-status-chart";
import { DashboardFilters } from "@/components/modules/dashboard-filters";
import { KpiCard } from "@/components/ui/kpi-card";
import { getDashboardData, type DashboardData, type Period, type MarketFilter, type RevenuePoint } from "@/lib/actions/dashboard";
import {
  TrendingUp, Receipt, FileText, Briefcase,
  AlertTriangle, Users, Wallet, BarChart3, CalendarClock,
} from "lucide-react";

function fmt(n: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

function RecentActivity({ items, currency }: { items: DashboardData["recentInvoices"]; currency: string }) {
  const statusColor: Record<string, string> = {
    paid: "var(--color-success)", overdue: "var(--color-danger)",
    sent: "var(--color-accent)", draft: "var(--color-text-3)",
  };
  const statusLabel: Record<string, string> = {
    paid: "Payée", overdue: "En retard", sent: "Envoyée",
    draft: "Brouillon", partial: "Partielle", cancelled: "Annulée",
  };

  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h2 className="font-heading text-sm font-semibold text-[var(--color-text)]">Dernières factures</h2>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {items.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-[var(--color-text-3)]">Aucune facture récente</p>
        )}
        {items.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer"
          >
            <div className="w-1.5 h-6 rounded-full shrink-0" style={{ backgroundColor: statusColor[inv.status] ?? "var(--color-text-3)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--color-text)] truncate">{inv.client}</p>
              <p className="text-3xs text-[var(--color-text-3)]">{inv.number} · {new Date(inv.date).toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold tabular-nums text-[var(--color-text)]">{fmt(inv.amount, currency)}</p>
              <p className="text-3xs" style={{ color: statusColor[inv.status] ?? "var(--color-text-3)" }}>
                {statusLabel[inv.status] ?? inv.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingMissions({ items }: { items: DashboardData["upcomingMissions"] }) {
  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h2 className="font-heading text-sm font-semibold text-[var(--color-text)]">Échéances à venir (7 jours)</h2>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {items.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-[var(--color-text-3)]">Aucune échéance proche</p>
        )}
        {items.map((m) => {
          const date = m.endDate ?? m.startDate;
          const label = m.endDate ? "Fin" : "Début";
          return (
            <div
              key={m.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer"
            >
              <CalendarClock className="w-4 h-4 shrink-0 text-[var(--color-warning)]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--color-text)] truncate">{m.title}</p>
                <p className="text-3xs text-[var(--color-text-3)]">{m.client}</p>
              </div>
              {date && (
                <div className="text-right shrink-0">
                  <p className="text-3xs text-[var(--color-text-3)]">{label}</p>
                  <p className="text-xs font-medium text-[var(--color-text)]">{new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: "Nouveau devis", href: "/devis/new", color: "var(--color-accent)", bg: "var(--color-accent-dim)" },
    { label: "Nouvelle facture", href: "/factures/new", color: "var(--color-success)", bg: "var(--color-success-dim)" },
    { label: "Nouveau client", href: "/clients/new", color: "var(--color-warning)", bg: "var(--color-warning-dim)" },
  ];
  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4">
      <h2 className="font-heading text-sm font-semibold text-[var(--color-text)] mb-3">Actions rapides</h2>
      <div className="space-y-2">
        {actions.map((a) => (
          <a
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-all duration-[var(--dur-fast)] hover:shadow-[var(--shadow-sm)] hover:brightness-105 cursor-pointer"
            style={{ backgroundColor: a.bg, color: a.color }}
          >
            <span className="text-xs font-medium">{a.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

const PERIOD_LABEL: Record<Period, string> = { month: "CA ce mois", quarter: "CA ce trimestre", year: "CA cette année" };

function DashboardError() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center space-y-2 max-w-sm">
        <AlertTriangle className="w-8 h-8 mx-auto text-[var(--color-danger)]" />
        <p className="text-sm font-medium text-[var(--color-text)]">Impossible de charger le tableau de bord</p>
        <p className="text-xs text-[var(--color-text-3)]">Vérifiez votre connexion et réessayez dans quelques instants.</p>
      </div>
    </div>
  );
}

interface DashboardPageProps {
  searchParams: Promise<{ period?: string; market?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const period = (params.period as Period) ?? "month";
  const marketParam = params.market as MarketFilter | undefined;

  let data: DashboardData | null = null;
  try {
    data = await getDashboardData(period, marketParam);
  } catch {
    data = null;
  }

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  if (!data) {
    return (
      <>
        <Header title="Tableau de bord" subtitle={today} />
        <DashboardError />
      </>
    );
  }

  const kpis = data.kpis;
  const currency = data.currency;
  const year = data.year;
  const market = data.market;

  /* Transform chartData into RevenuePoint[] for the chart */
  const revenuePoints: RevenuePoint[] = data.chartData.flatMap((d) => [
    { month: d.month, revenue: d.france, market: "france" as const },
    { month: d.month, revenue: d.guinee, market: "guinee" as const },
  ]);

  return (
    <>
      <Header title="Tableau de bord" subtitle={today} />

      <div className="flex-1 p-4 md:p-6 lg:p-7 space-y-5">
        <div className="max-w-[1200px] mx-auto space-y-5">
          {/* Filtres */}
          <DashboardFilters period={period} market={market} />

          {/* KPI row 1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label={PERIOD_LABEL[period]}
              value={fmt(kpis.period_revenue, currency)}
              rawValue={kpis.period_revenue}
              format="currency"
              currency={currency}
              icon={<TrendingUp className="w-4 h-4" />}
              accentColor="var(--color-success)"
              index={0}
            />
            <KpiCard
              label="CA cette année"
              value={fmt(kpis.revenue_year, currency)}
              rawValue={kpis.revenue_year}
              format="currency"
              currency={currency}
              icon={<BarChart3 className="w-4 h-4" />}
              accentColor="var(--color-accent)"
              index={1}
            />
            <KpiCard
              label="Devis en attente"
              value={kpis.pending_quotes}
              rawValue={kpis.pending_quotes}
              subtitle={fmt(kpis.pending_quotes_amount, currency)}
              icon={<FileText className="w-4 h-4" />}
              accentColor="var(--color-warning)"
              index={2}
            />
            <KpiCard
              label="Factures impayées"
              value={kpis.unpaid_invoices}
              rawValue={kpis.unpaid_invoices}
              subtitle={fmt(kpis.unpaid_invoices_amount, currency)}
              icon={<Receipt className="w-4 h-4" />}
              accentColor="var(--color-danger)"
              index={3}
            />
          </div>

          {/* KPI row 2 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Clients actifs"
              value={kpis.total_clients}
              rawValue={kpis.total_clients}
              icon={<Users className="w-4 h-4" />}
              accentColor="var(--color-info)"
              index={4}
            />
            <KpiCard
              label="Missions en cours"
              value={kpis.active_missions}
              rawValue={kpis.active_missions}
              icon={<Briefcase className="w-4 h-4" />}
              accentColor="var(--color-accent)"
              index={5}
            />
            <KpiCard
              label="Factures en retard"
              value={kpis.overdue_invoices}
              rawValue={kpis.overdue_invoices}
              subtitle={kpis.overdue_amount > 0 ? fmt(kpis.overdue_amount, currency) : undefined}
              icon={<AlertTriangle className="w-4 h-4" />}
              accentColor="var(--color-danger)"
              trend={kpis.overdue_invoices > 0 ? "down" : "neutral"}
              index={6}
            />
            <KpiCard
              label="Taux d'encaissement"
              value={`${Math.round(kpis.collection_rate)}%`}
              rawValue={kpis.collection_rate}
              format="percent"
              icon={<Wallet className="w-4 h-4" />}
              accentColor="var(--color-success)"
              trend={kpis.collection_rate >= 80 ? "up" : "down"}
              trendValue={`${Math.round(kpis.collection_rate)}% encaissé`}
              index={7}
            />
          </div>

          {/* KPI row 3 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Taux de conversion"
              value={`${Math.round(kpis.conversion_rate)}%`}
              rawValue={kpis.conversion_rate}
              format="percent"
              subtitle="Devis acceptés / décidés"
              icon={<TrendingUp className="w-4 h-4" />}
              accentColor="var(--color-info)"
              trend={kpis.conversion_rate >= 50 ? "up" : "down"}
              index={8}
            />
            <KpiCard
              label="Échéances à venir"
              value={kpis.upcoming_missions_count}
              rawValue={kpis.upcoming_missions_count}
              subtitle="Missions sous 7 jours"
              icon={<CalendarClock className="w-4 h-4" />}
              accentColor="var(--color-warning)"
              trend={kpis.upcoming_missions_count > 0 ? "down" : "neutral"}
              index={9}
            />
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 space-y-5">
              <RevenueChart data={revenuePoints} year={year} currency={currency} market={market === "all" ? "france" : market} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InvoiceStatusChart
                  data={data.invoiceStatusBreakdown as StatusBreakdownItem[]}
                  currency={currency}
                  title="Factures par statut"
                />
                <InvoiceStatusChart
                  data={data.quoteStatusBreakdown as StatusBreakdownItem[]}
                  currency={currency}
                  title="Devis par statut"
                />
              </div>

              <UpcomingMissions items={data.upcomingMissions} />
            </div>

            <div className="space-y-4">
              <RecentActivity items={data.recentInvoices} currency={currency} />
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
