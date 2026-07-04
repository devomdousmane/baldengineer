"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Receipt } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types/database";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft:     "Brouillon",
  sent:      "En attente",
  paid:      "Payée",
  partial:   "Partielle",
  overdue:   "En retard",
  cancelled: "Annulée",
};

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft:     "var(--color-text-3)",
  sent:      "var(--color-warning)",
  paid:      "var(--color-success)",
  partial:   "var(--color-accent)",
  overdue:   "var(--color-danger)",
  cancelled: "var(--color-text-3)",
};

const STATUS_FILTERS = [
  { value: "", label: "Toutes" },
  { value: "sent", label: STATUS_LABELS.sent },
  { value: "partial", label: STATUS_LABELS.partial },
  { value: "overdue", label: STATUS_LABELS.overdue },
  { value: "paid", label: STATUS_LABELS.paid },
];

interface Props {
  invoices: Invoice[];
  currency: string;
}

export function PaymentsTable({ invoices, currency }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (status && inv.status !== status) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${inv.number} ${(inv.client as { name?: string })?.name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [invoices, search, status]);

  return (
    <div className="space-y-3">
      <ListToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Rechercher facture, client…"
        filters={STATUS_FILTERS}
        active={status}
        onFilter={setStatus}
      />

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] overflow-x-auto shadow-[var(--shadow-xs)]">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]" style={{ backgroundColor: "var(--table-header-bg)" }}>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--color-text-2)]">Numéro</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--color-text-2)]">Client</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--color-text-2)] hidden md:table-cell">Échéance</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[var(--color-text-2)]">Total TTC</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[var(--color-text-2)]">Payé</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-[var(--color-text-2)]">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Receipt className="w-8 h-8 text-[var(--color-text-3)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--color-text-3)]">Aucune facture trouvée</p>
                </td>
              </tr>
            ) : (
              filtered.map((inv, i) => {
                const color = STATUS_COLORS[inv.status];
                const remaining = inv.total_ttc - inv.paid_amount;
                const paidPct = inv.total_ttc > 0 ? Math.min(100, Math.round((inv.paid_amount / inv.total_ttc) * 100)) : 0;
                const isOverdue = inv.status === "overdue";

                return (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                    onClick={() => router.push(`/factures/${inv.id}`)}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-2)] transition-colors duration-[var(--dur-fast)] cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[var(--color-accent)]">{inv.number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-[var(--color-text)]">{(inv.client as { name?: string })?.name ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs" style={{ color: isOverdue ? "var(--color-danger)" : "var(--color-text-2)" }}>
                        {new Date(inv.due_date).toLocaleDateString("fr-FR")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-semibold tabular-nums text-[var(--color-text)]">{fmt(inv.total_ttc)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.paid_amount > 0 ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs tabular-nums font-semibold" style={{ color: "var(--color-success)" }}>{fmt(inv.paid_amount)}</span>
                          <div className="w-16 h-1.5 rounded-full bg-[var(--color-bg-2)] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${paidPct}%`, backgroundColor: "var(--color-success)" }} />
                          </div>
                          {inv.status === "partial" && (
                            <span className="text-[10px] text-[var(--color-text-3)]">reste {fmt(remaining)}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-text-3)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border"
                        style={{ color, borderColor: `${color}40`, backgroundColor: `${color}18` }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-[var(--color-text-3)] text-right">
          {filtered.length} facture{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
