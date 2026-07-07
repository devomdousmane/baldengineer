import { getInvoices } from "@/lib/actions/invoices";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Market, InvoiceStatus } from "@/types/database";

const statusBadge: Record<InvoiceStatus, { label: string; variant: "success" | "warning" | "danger" | "info" | "default" | "outline" }> = {
  draft:     { label: "Brouillon",  variant: "default"  },
  sent:      { label: "Envoyée",    variant: "info"     },
  paid:      { label: "Payée",      variant: "success"  },
  partial:   { label: "Partielle",  variant: "warning"  },
  overdue:   { label: "En retard",  variant: "danger"   },
  cancelled: { label: "Annulée",    variant: "outline"  },
};

export async function RecentInvoices({ market }: { market: Market }) {
  const invoices = await getInvoices(market);
  const recent = invoices.slice(0, 6);
  const currency = market === "france" ? "EUR" : "GNF";

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  return (
    <Card padding="md" className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Factures récentes</h2>
        <Link
          href="/factures"
          className="text-xs text-[var(--color-accent)] hover:underline"
        >
          Voir tout
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="text-xs text-[var(--color-text-3)] text-center py-6">Aucune facture</p>
      ) : (
        <ul className="space-y-2.5">
          {recent.map((inv) => {
            const { label, variant } = statusBadge[inv.status];
            return (
              <li key={inv.id}>
                <Link
                  href={`/factures/${inv.id}`}
                  className="flex items-center gap-2 hover:bg-[var(--color-bg-2)] rounded-[var(--radius-sm)] px-2 py-1.5 -mx-2 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--color-text)] truncate">{inv.number}</p>
                    <p className="text-2xs text-[var(--color-text-3)] truncate">
                      {(inv.client as { name?: string })?.name ?? "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-[var(--color-text)] tabular-nums">{fmt(inv.total_ttc)}</p>
                    <Badge variant={variant} className="mt-0.5">{label}</Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
