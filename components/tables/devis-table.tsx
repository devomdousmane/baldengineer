"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { FileText, Calendar, Euro } from "lucide-react";
import type { Quote, QuoteStatus } from "@/types/database";

const statusConfig: Record<QuoteStatus, { label: string; variant: "default" | "info" | "success" | "danger" | "warning" | "outline" }> = {
  draft:    { label: "Brouillon", variant: "default" },
  sent:     { label: "Envoyé",    variant: "info"    },
  accepted: { label: "Accepté",   variant: "success" },
  refused:  { label: "Refusé",    variant: "danger"  },
  expired:  { label: "Expiré",    variant: "outline" },
};

const STATUS_FILTERS = [
  { value: "", label: "Tous" },
  ...(Object.keys(statusConfig) as QuoteStatus[]).map((s) => ({ value: s, label: statusConfig[s].label })),
];

function makeColumns(fmt: (n: number) => string): Column<Quote>[] {
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
      key: "valid_until", label: "Validité", sortable: true,
      render: (v) => new Date(String(v)).toLocaleDateString("fr-FR"),
    },
    {
      key: "total_ttc", label: "TTC", align: "right", sortable: true,
      render: (v) => <span className="font-semibold tabular-nums">{fmt(v as number)}</span>,
    },
    {
      key: "status", label: "Statut",
      render: (v) => {
        const cfg = statusConfig[v as QuoteStatus];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
  ];
}

function DevisGrid({ quotes, fmt, onRowClick }: { quotes: Quote[]; fmt: (n: number) => string; onRowClick: (q: Quote) => void }) {
  if (quotes.length === 0) return <EmptyState message="Aucun devis" />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {quotes.map((q, i) => {
        const cfg = statusConfig[q.status];
        return (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 hover:shadow-[var(--shadow-md)] transition-all cursor-pointer"
            onClick={() => onRowClick(q)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}>
                <FileText className="w-4 h-4" />
              </div>
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
            <p className="font-mono text-xs text-[var(--color-accent)] mb-1">{q.number}</p>
            <p className="font-semibold text-sm text-[var(--color-text)] truncate mb-1">{q.title}</p>
            <p className="text-xs text-[var(--color-text-2)] mb-3 truncate">{(q.client as { name?: string })?.name ?? "—"}</p>
            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
              <div className="flex items-center gap-1 text-xs text-[var(--color-text-3)]">
                <Calendar className="w-3 h-3" />
                <span>{new Date(q.date).toLocaleDateString("fr-FR")}</span>
              </div>
              <span className="font-semibold text-sm tabular-nums text-[var(--color-text)]">{fmt(q.total_ttc)}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function DevisList({ quotes, fmt, onRowClick }: { quotes: Quote[]; fmt: (n: number) => string; onRowClick: (q: Quote) => void }) {
  if (quotes.length === 0) return <EmptyState message="Aucun devis" />;
  return (
    <div className="space-y-1.5">
      {quotes.map((q, i) => {
        const cfg = statusConfig[q.status];
        return (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            className="flex items-center gap-3 px-4 py-3 bg-[var(--color-card)] rounded-[var(--radius-md)] border border-[var(--color-border)] hover:shadow-[var(--shadow-sm)] transition-all cursor-pointer"
            onClick={() => onRowClick(q)}
          >
            <span className="font-mono text-xs text-[var(--color-accent)] w-28 shrink-0">{q.number}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">{q.title}</p>
              <p className="text-xs text-[var(--color-text-3)] truncate">{(q.client as { name?: string })?.name ?? "—"}</p>
            </div>
            <span className="font-semibold text-sm tabular-nums text-[var(--color-text)] shrink-0">{fmt(q.total_ttc)}</span>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </motion.div>
        );
      })}
    </div>
  );
}

export function DevisTable({ quotes, currency }: { quotes: Quote[]; currency: string }) {
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);

  const debouncedSearch = useDebouncedValue(search);

  const filtered = useMemo(() => {
    return quotes.filter((q) => {
      if (status && q.status !== status) return false;
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        const hay = `${q.number} ${q.title} ${(q.client as { name?: string })?.name ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [quotes, debouncedSearch, status]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-text-3)]">{filtered.length} devis</p>
        <ViewToggle value={view} onChange={setView} />
      </div>
      <ListToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Rechercher un devis…"
        filters={STATUS_FILTERS}
        active={status}
        onFilter={setStatus}
      />
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {view === "table" && (
            <DataTable<Quote>
              data={filtered}
              columns={makeColumns(fmt)}
              emptyMessage="Aucun devis"
              onRowClick={(q) => router.push(`/devis/${q.id}`)}
            />
          )}
          {view === "grid" && <DevisGrid quotes={filtered} fmt={fmt} onRowClick={(q) => router.push(`/devis/${q.id}`)} />}
          {view === "list" && <DevisList quotes={filtered} fmt={fmt} onRowClick={(q) => router.push(`/devis/${q.id}`)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
