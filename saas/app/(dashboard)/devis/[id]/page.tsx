import { notFound } from "next/navigation";
import Link from "next/link";
import { getQuote } from "@/lib/actions/quotes";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DevisActions } from "@/components/modules/devis-actions";
import { ArrowLeft, Printer, Building2, User, Calendar, Hash } from "lucide-react";
import type { QuoteStatus, QuoteLine } from "@/types/database";

const statusConfig: Record<QuoteStatus, { label: string; variant: "default" | "info" | "success" | "danger" | "warning" | "outline" }> = {
  draft:    { label: "Brouillon", variant: "default" },
  sent:     { label: "Envoyé",    variant: "info"    },
  accepted: { label: "Accepté",   variant: "success" },
  refused:  { label: "Refusé",    variant: "danger"  },
  expired:  { label: "Expiré",    variant: "outline" },
};

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
}

function LineRow({ line, currency }: { line: QuoteLine; currency: string }) {
  const ht = Math.round(line.quantity * line.unit_price * (1 - line.discount_pct / 100) * 100) / 100;
  return (
    <tr className="border-b border-[var(--color-border)] last:border-0">
      <td className="py-3 pr-4 text-sm text-[var(--color-text)]">{line.description}</td>
      <td className="py-3 px-4 text-sm text-center tabular-nums text-[var(--color-text-2)]">{line.quantity}</td>
      <td className="py-3 px-4 text-sm text-center text-[var(--color-text-2)]">{line.unit}</td>
      <td className="py-3 px-4 text-sm text-right tabular-nums text-[var(--color-text-2)]">{fmt(line.unit_price, currency)}</td>
      {line.discount_pct > 0 && (
        <td className="py-3 px-4 text-sm text-right tabular-nums text-[var(--color-warning)]">-{line.discount_pct}%</td>
      )}
      <td className="py-3 pl-4 text-sm text-right tabular-nums font-medium text-[var(--color-text)]">{fmt(ht, currency)}</td>
      <td className="py-3 pl-4 text-sm text-right tabular-nums text-[var(--color-text-2)]">{line.vat_rate}%</td>
    </tr>
  );
}

export default async function DevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  const cfg = statusConfig[quote.status];
  const currency = quote.currency;
  const lines = quote.lines ?? [];
  const hasDiscount = lines.some((l) => l.discount_pct > 0);
  const canConvert = quote.status === "accepted" && !quote.converted_to_invoice_id;

  return (
    <>
      <Header
        title={`Devis ${quote.number}`}
        subtitle={quote.title}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/print/devis/${id}`} target="_blank">
              <Button variant="outline" size="sm" iconLeft={<Printer className="w-3.5 h-3.5" />}>
                Imprimer / PDF
              </Button>
            </Link>
            <Link href="/devis">
              <Button variant="ghost" size="sm" iconLeft={<ArrowLeft className="w-3.5 h-3.5" />}>
                Retour
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-5 space-y-4 max-w-4xl">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center gap-3">
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
            {quote.converted_to_invoice_id && (
              <Link href={`/factures/${quote.converted_to_invoice_id}`}>
                <Badge variant="success" className="cursor-pointer hover:opacity-80">→ Facture créée</Badge>
              </Link>
            )}
          </div>
          <DevisActions quote={quote} canConvert={canConvert} />
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card padding="sm">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-3.5 h-3.5 text-[var(--color-text-3)]" />
              <p className="text-xs text-[var(--color-text-3)]">Numéro</p>
            </div>
            <p className="font-mono text-sm font-medium text-[var(--color-accent)]">{quote.number}</p>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-2 mb-1">
              {quote.client?.type === "company"
                ? <Building2 className="w-3.5 h-3.5 text-[var(--color-text-3)]" />
                : <User className="w-3.5 h-3.5 text-[var(--color-text-3)]" />}
              <p className="text-xs text-[var(--color-text-3)]">Client</p>
            </div>
            <p className="text-sm font-medium text-[var(--color-text)] truncate">{quote.client?.name ?? "—"}</p>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-text-3)]" />
              <p className="text-xs text-[var(--color-text-3)]">Date</p>
            </div>
            <p className="text-sm font-medium text-[var(--color-text)]">
              {new Date(quote.date).toLocaleDateString("fr-FR")}
            </p>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-text-3)]" />
              <p className="text-xs text-[var(--color-text-3)]">Validité</p>
            </div>
            <p className="text-sm font-medium text-[var(--color-text)]">
              {new Date(quote.valid_until).toLocaleDateString("fr-FR")}
            </p>
          </Card>
        </div>

        {/* Lines */}
        <Card padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Lignes du devis</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-2.5 pr-4 text-left text-xs font-medium text-[var(--color-text-3)]">Description</th>
                  <th className="py-2.5 px-4 text-center text-xs font-medium text-[var(--color-text-3)]">Qté</th>
                  <th className="py-2.5 px-4 text-center text-xs font-medium text-[var(--color-text-3)]">Unité</th>
                  <th className="py-2.5 px-4 text-right text-xs font-medium text-[var(--color-text-3)]">P.U.</th>
                  {hasDiscount && <th className="py-2.5 px-4 text-right text-xs font-medium text-[var(--color-text-3)]">Remise</th>}
                  <th className="py-2.5 pl-4 text-right text-xs font-medium text-[var(--color-text-3)]">Total HT</th>
                  <th className="py-2.5 pl-4 text-right text-xs font-medium text-[var(--color-text-3)]">TVA</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => <LineRow key={l.id} line={l} currency={currency} />)}
                {lines.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-xs text-[var(--color-text-3)]">Aucune ligne</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-[var(--color-border)] px-4 py-4">
            <div className="ml-auto w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-2)]">Sous-total HT</span>
                <span className="tabular-nums font-medium">{fmt(quote.subtotal_ht, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-2)]">TVA</span>
                <span className="tabular-nums">{fmt(quote.total_vat, currency)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-[var(--color-border)] pt-2">
                <span>Total TTC</span>
                <span className="tabular-nums text-[var(--color-accent)]">{fmt(quote.total_ttc, currency)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {(quote.notes || quote.terms) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quote.notes && (
              <Card padding="md">
                <h3 className="text-xs font-semibold text-[var(--color-text-3)] uppercase mb-2">Notes</h3>
                <p className="text-sm text-[var(--color-text-2)] whitespace-pre-wrap">{quote.notes}</p>
              </Card>
            )}
            {quote.terms && (
              <Card padding="md">
                <h3 className="text-xs font-semibold text-[var(--color-text-3)] uppercase mb-2">Conditions</h3>
                <p className="text-sm text-[var(--color-text-2)] whitespace-pre-wrap">{quote.terms}</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}
