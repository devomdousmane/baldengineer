"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, AlertTriangle } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types/database";

const statusConfig: Record<InvoiceStatus, { label: string; variant: "default" | "info" | "success" | "danger" | "warning" | "outline" }> = {
  draft:     { label: "Brouillon", variant: "default" },
  sent:      { label: "Envoyée",   variant: "info"    },
  paid:      { label: "Payée",     variant: "success" },
  partial:   { label: "Partielle", variant: "warning" },
  overdue:   { label: "En retard", variant: "danger"  },
  cancelled: { label: "Annulée",   variant: "outline" },
};

const STATUS_FILTERS = [
  { value: "", label: "Toutes" },
  ...(Object.keys(statusConfig) as InvoiceStatus[]).map((s) => ({ value: s, label: statusConfig[s].label })),
];

function makeColumns(fmt: (n: number) => string): Column<Invoice>[] {
  return [
    {
      key: "number", label: "N°", sortable: true,
      render: (v) => <span className="font-mono text-xs text-[var(--color-accent)]">{String(v)}</span>,
    },
    {
      key: "client", label: "Client",
      render: (_, row) => <span className="font-medium">{(row.client as { name?: string })?.name ?? "—"}</span>,
    },
    { key: "title", label: "Titre" },
    {
      key: "date", label: "Date", sortable: true,
      render: (v) => new Date(String(v)).toLocaleDateString("fr-FR"),
    },
    {
      key: "due_date", label: "Échéance", sortable: true,
      render: (v, row) => {
        const overdue = row.status === "overdue" || (row.status === "sent" && new Date(String(v)) < new Date());
        return <span style={{ color: overdue ? "var(--color-danger)" : undefined }}>{new Date(String(v)).toLocaleDateString("fr-FR")}</span>;
      },
    },
    {
      key: "total_ttc", label: "TTC", align: "right", sortable: true,
      render: (v) => <span className="font-semibold tabular-nums">{fmt(v as number)}</span>,
    },
    {
      key: "paid_amount", label: "Payé", align: "right",
      render: (v, row) => (
        <span className="tabular-nums" style={{ color: row.status === "paid" ? "var(--color-success)" : "var(--color-text-2)" }}>
          {fmt(v as number)}
        </span>
      ),
    },
    {
      key: "status", label: "Statut",
      render: (v, row) => (
        <div className="flex items-center gap-1.5">
          <Badge variant={statusConfig[v as InvoiceStatus].variant}>{statusConfig[v as InvoiceStatus].label}</Badge>
          {row.market === "france" && row.facturx_status && row.facturx_status !== "none" && (
            <Badge variant="info">Factur-X</Badge>
          )}
        </div>
      ),
    },
  ];
}

function FactureGrid({ invoices, fmt, onRowClick }: { invoices: Invoice[]; fmt: (n: number) => string; onRowClick: (inv: Invoice) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {invoices.map((inv, i) => {
        const cfg = statusConfig[inv.status];
        const overdue = inv.status === "overdue";
        const pctPaid = inv.total_ttc > 0 ? (inv.paid_amount / inv.total_ttc) * 100 : 0;
        return (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 hover:shadow-[var(--shadow-md)] transition-all cursor-pointer"
            onClick={() => onRowClick(inv)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center"
                style={{ backgroundColor: overdue ? "var(--color-danger-dim)" : "var(--color-success-dim)", color: overdue ? "var(--color-danger)" : "var(--color-success)" }}>
                {overdue ? <AlertTriangle className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
              </div>
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
            <p className="font-mono text-xs text-[var(--color-accent)] mb-1">{inv.number}</p>
            <p className="font-semibold text-sm text-[var(--color-text)] truncate mb-1">{inv.title}</p>
            <p className="text-xs text-[var(--color-text-2)] truncate mb-3">{(inv.client as { name?: string })?.name ?? "—"}</p>
            {inv.status === "partial" && (
              <div className="mb-3">
                <div className="h-1.5 rounded-full bg-[var(--color-bg-2)] overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pctPaid}%`, backgroundColor: "var(--color-warning)" }} />
                </div>
                <p className="text-[10px] text-[var(--color-text-3)] mt-1">{Math.round(pctPaid)}% encaissé</p>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
              <div className="flex items-center gap-1 text-xs text-[var(--color-text-3)]">
                <Calendar className="w-3 h-3" />
                <span>Éch. {new Date(inv.due_date).toLocaleDateString("fr-FR")}</span>
              </div>
              <span className="font-semibold text-sm tabular-nums text-[var(--color-text)]">{fmt(inv.total_ttc)}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function FactureList({ invoices, fmt, onRowClick }: { invoices: Invoice[]; fmt: (n: number) => string; onRowClick: (inv: Invoice) => void }) {
  return (
    <div className="space-y-1.5">
      {invoices.map((inv, i) => {
        const cfg = statusConfig[inv.status];
        return (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            className="flex items-center gap-3 px-4 py-3 bg-[var(--color-card)] rounded-[var(--radius-md)] border border-[var(--color-border)] hover:shadow-[var(--shadow-sm)] transition-all cursor-pointer"
            onClick={() => onRowClick(inv)}
          >
            <span className="font-mono text-xs text-[var(--color-accent)] w-28 shrink-0">{inv.number}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">{inv.title}</p>
              <p className="text-xs text-[var(--color-text-3)]">Éch. {new Date(inv.due_date).toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-sm tabular-nums text-[var(--color-text)]">{fmt(inv.total_ttc)}</p>
              {inv.paid_amount > 0 && inv.status !== "paid" && (
                <p className="text-xs tabular-nums" style={{ color: "var(--color-warning)" }}>+{fmt(inv.paid_amount)}</p>
              )}
            </div>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </motion.div>
        );
      })}
    </div>
  );
}

export function FacturesTable({ invoices, currency }: { invoices: Invoice[]; currency: string }) {
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (status && inv.status !== status) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${inv.number} ${inv.title} ${(inv.client as { name?: string })?.name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [invoices, search, status]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-text-3)]">{filtered.length} facture{filtered.length !== 1 ? "s" : ""}</p>
        <ViewToggle value={view} onChange={setView} />
      </div>
      <ListToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Rechercher une facture…"
        filters={STATUS_FILTERS}
        active={status}
        onFilter={setStatus}
      />
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {view === "table" && (
            <DataTable<Invoice>
              data={filtered}
              columns={makeColumns(fmt)}
              emptyMessage="Aucune facture"
              onRowClick={(inv) => router.push(`/factures/${inv.id}`)}
            />
          )}
          {view === "grid" && <FactureGrid invoices={filtered} fmt={fmt} onRowClick={(inv) => router.push(`/factures/${inv.id}`)} />}
          {view === "list" && <FactureList invoices={filtered} fmt={fmt} onRowClick={(inv) => router.push(`/factures/${inv.id}`)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
