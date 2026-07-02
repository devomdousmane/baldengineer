"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { KpiCard } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { AiPanel } from "@/components/ai/ai-panel";
import { RevenueChart } from "@/components/modules/revenue-chart";
import type { RevenuePoint } from "@/lib/actions/dashboard";
import {
  TrendingUp, Receipt, FileText, Briefcase,
  AlertTriangle, Users, Wallet, BarChart3,
} from "lucide-react";

interface DashboardData {
  kpis: {
    revenue_month: number; revenue_year: number;
    pending_quotes: number; pending_quotes_amount: number;
    unpaid_invoices: number; unpaid_invoices_amount: number;
    active_missions: number; overdue_invoices: number;
    overdue_amount: number; total_clients: number;
    collection_rate: number;
  };
  chartData: { month: string; france: number; guinee: number }[];
  recentInvoices: { id: string; number: string; client: string; amount: number; status: string; date: string }[];
  currency: string;
  market: string;
  year: number;
}

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
        {items.map((inv, i) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05, duration: 0.25 }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer"
          >
            <div className="w-1.5 h-6 rounded-full shrink-0" style={{ backgroundColor: statusColor[inv.status] ?? "var(--color-text-3)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--color-text)] truncate">{inv.client}</p>
              <p className="text-[10px] text-[var(--color-text-3)]">{inv.number} · {new Date(inv.date).toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold tabular-nums text-[var(--color-text)]">{fmt(inv.amount, currency)}</p>
              <p className="text-[10px]" style={{ color: statusColor[inv.status] ?? "var(--color-text-3)" }}>
                {statusLabel[inv.status] ?? inv.status}
              </p>
            </div>
          </motion.div>
        ))}
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-all hover:shadow-[var(--shadow-sm)]"
            style={{ backgroundColor: a.bg, color: a.color }}
          >
            <span className="text-xs font-medium">{a.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [aiOpen, setAiOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const kpis = data?.kpis;
  const currency = data?.currency ?? "EUR";
  const market = data?.market ?? "france";
  const year = data?.year ?? new Date().getFullYear();
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  /* Transform chartData into RevenuePoint[] for the chart */
  const revenuePoints: RevenuePoint[] = (data?.chartData ?? []).flatMap((d) => [
    { month: d.month, revenue: d.france, market: "france" as const },
    { month: d.month, revenue: d.guinee, market: "guinee" as const },
  ]);

  return (
    <>
      <Header
        title="Tableau de bord"
        subtitle={today}
        onAiOpen={() => setAiOpen(true)}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 p-4 md:p-6 lg:p-7 space-y-5"
      >
        <div className="max-w-[1200px] mx-auto space-y-5">
        {/* KPI row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="CA ce mois"
            value={kpis ? fmt(kpis.revenue_month, currency) : "—"}
            rawValue={kpis?.revenue_month}
            formatValue={(n) => fmt(n, currency)}
            icon={<TrendingUp className="w-4 h-4" />}
            accentColor="var(--color-success)"
            index={0}
          />
          <KpiCard
            label="CA cette année"
            value={kpis ? fmt(kpis.revenue_year, currency) : "—"}
            rawValue={kpis?.revenue_year}
            formatValue={(n) => fmt(n, currency)}
            icon={<BarChart3 className="w-4 h-4" />}
            accentColor="var(--color-accent)"
            index={1}
          />
          <KpiCard
            label="Devis en attente"
            value={kpis?.pending_quotes ?? "—"}
            rawValue={kpis?.pending_quotes}
            subtitle={kpis ? fmt(kpis.pending_quotes_amount, currency) : undefined}
            icon={<FileText className="w-4 h-4" />}
            accentColor="var(--color-warning)"
            index={2}
          />
          <KpiCard
            label="Factures impayées"
            value={kpis?.unpaid_invoices ?? "—"}
            rawValue={kpis?.unpaid_invoices}
            subtitle={kpis ? fmt(kpis.unpaid_invoices_amount, currency) : undefined}
            icon={<Receipt className="w-4 h-4" />}
            accentColor="var(--color-danger)"
            index={3}
          />
        </div>

        {/* KPI row 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Clients actifs"
            value={kpis?.total_clients ?? "—"}
            rawValue={kpis?.total_clients}
            icon={<Users className="w-4 h-4" />}
            accentColor="var(--color-info)"
            index={4}
          />
          <KpiCard
            label="Missions en cours"
            value={kpis?.active_missions ?? "—"}
            rawValue={kpis?.active_missions}
            icon={<Briefcase className="w-4 h-4" />}
            accentColor="var(--color-accent)"
            index={5}
          />
          <KpiCard
            label="Factures en retard"
            value={kpis?.overdue_invoices ?? "—"}
            rawValue={kpis?.overdue_invoices}
            subtitle={kpis && kpis.overdue_amount > 0 ? fmt(kpis.overdue_amount, currency) : undefined}
            icon={<AlertTriangle className="w-4 h-4" />}
            accentColor="var(--color-danger)"
            trend={kpis && kpis.overdue_invoices > 0 ? "down" : "neutral"}
            index={6}
          />
          <KpiCard
            label="Taux d'encaissement"
            value={kpis ? `${Math.round(kpis.collection_rate)}%` : "—"}
            rawValue={kpis?.collection_rate}
            formatValue={(n) => `${Math.round(n)}%`}
            icon={<Wallet className="w-4 h-4" />}
            accentColor="var(--color-success)"
            trend={kpis && kpis.collection_rate >= 80 ? "up" : "down"}
            trendValue={kpis ? `${Math.round(kpis.collection_rate)}% encaissé` : undefined}
            index={7}
          />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            {data ? (
              <RevenueChart data={revenuePoints} year={year} currency={currency} />
            ) : (
              <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 h-[280px] animate-pulse" />
            )}
          </div>

          <div className="space-y-4">
            <RecentActivity items={data?.recentInvoices ?? []} currency={currency} />
            <QuickActions />
          </div>
        </div>
        </div>
      </motion.div>

      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} market={market} />
    </>
  );
}
