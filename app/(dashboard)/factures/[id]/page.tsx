import { notFound } from "next/navigation";
import Link from "next/link";
import { getInvoice } from "@/lib/actions/invoices";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { FactureActions } from "@/components/modules/facture-actions";
import { FacturXDownloadButton } from "@/components/modules/facturx-download-button";
import { ArrowLeft, Printer, Building2, User, Calendar, Hash, CreditCard } from "lucide-react";
import type { InvoiceStatus, InvoiceLine } from "@/types/database";

const statusConfig: Record<InvoiceStatus, { label: string; variant: "default" | "info" | "success" | "danger" | "warning" | "outline" }> = {
  draft:     { label: "Brouillon", variant: "default" },
  sent:      { label: "Envoyée",   variant: "info"    },
  paid:      { label: "Payée",     variant: "success" },
  partial:   { label: "Partielle", variant: "warning" },
  overdue:   { label: "En retard", variant: "danger"  },
  cancelled: { label: "Annulée",   variant: "outline" },
};

const facturxConfig: Record<string, { label: string; variant: "default" | "info" | "success" | "danger" | "warning" | "outline" }> = {
  none:         { label: "Non soumise",  variant: "default" },
  pending:      { label: "En attente",   variant: "warning" },
  submitted:    { label: "Soumise",      variant: "info"    },
  acknowledged: { label: "Acceptée",     variant: "success" },
  rejected:     { label: "Rejetée",      variant: "danger"  },
};

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
}

function LineRow({ line, currency }: { line: InvoiceLine; currency: string }) {
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

export default async function FactureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("bank_iban, bank_bic, bank_name, payment_terms_days")
    .eq("id", user!.id).single();

  const cfg = statusConfig[invoice.status];
  const currency = invoice.currency;
  const lines = invoice.lines ?? [];
  const hasDiscount = lines.some((l) => l.discount_pct > 0);
  const remaining = invoice.total_ttc - invoice.paid_amount;
  const canPay = invoice.status !== "paid" && invoice.status !== "cancelled";
  const pctPaid = invoice.total_ttc > 0 ? (invoice.paid_amount / invoice.total_ttc) * 100 : 0;

  const paymentMethodLabels: Record<string, string> = {
    virement: "Virement bancaire", cheque: "Chèque",
    especes: "Espèces", carte: "Carte bancaire", autre: "Autre",
  };

  return (
    <>
      <Header
        title={`Facture ${invoice.number}`}
        subtitle={invoice.title}
        actions={
          <div className="flex items-center gap-2">
            {invoice.market === "france" && (
              <FacturXDownloadButton invoiceId={id} invoiceNumber={invoice.number} />
            )}
            <Link href={`/print/factures/${id}`} target="_blank">
              <Button variant="outline" size="sm" iconLeft={<Printer className="w-3.5 h-3.5" />}>
                Imprimer / PDF
              </Button>
            </Link>
            <Link href="/factures">
              <Button variant="ghost" size="sm" iconLeft={<ArrowLeft className="w-3.5 h-3.5" />}>
                Retour
              </Button>
            </Link>
          </div>
        }
      />

      <PageWrapper>
        {/* Status bar */}
        <div className="flex items-center justify-between bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
            {invoice.market === "france" && invoice.facturx_status && invoice.facturx_status !== "none" && (
              <Badge variant={facturxConfig[invoice.facturx_status]?.variant ?? "default"}>
                Factur-X · {facturxConfig[invoice.facturx_status]?.label}
              </Badge>
            )}
            {invoice.quote_id && (
              <Link href={`/devis/${invoice.quote_id}`}>
                <Badge variant="info" className="cursor-pointer hover:opacity-80">← Devis source</Badge>
              </Link>
            )}
          </div>
          <FactureActions invoice={invoice} canPay={canPay} remaining={remaining} />
        </div>

        {/* Progress bar for partial */}
        {invoice.status === "partial" && (
          <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[var(--color-text-3)]">Encaissement</span>
              <span className="font-medium text-[var(--color-text)]">{fmt(invoice.paid_amount, currency)} / {fmt(invoice.total_ttc, currency)}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-bg-2)] overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pctPaid}%`, backgroundColor: "var(--color-warning)" }} />
            </div>
            <p className="text-xs text-[var(--color-text-3)] mt-1">{Math.round(pctPaid)}% encaissé · Reste {fmt(remaining, currency)}</p>
          </div>
        )}

        {/* Layout 2 colonnes — remplit la largeur disponible */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 items-start">
          {/* Colonne principale */}
          <div className="space-y-4 min-w-0">
            {/* Lines */}
            <Card padding="none">
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <h2 className="text-sm font-semibold text-[var(--color-text)]">Lignes de facturation</h2>
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
              <div className="border-t border-[var(--color-border)] px-4 py-4">
                <div className="ml-auto w-full sm:w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-2)]">Sous-total HT</span>
                    <span className="tabular-nums font-medium">{fmt(invoice.subtotal_ht, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-2)]">TVA</span>
                    <span className="tabular-nums">{fmt(invoice.total_vat, currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold border-t border-[var(--color-border)] pt-2">
                    <span>Total TTC</span>
                    <span className="tabular-nums text-[var(--color-accent)]">{fmt(invoice.total_ttc, currency)}</span>
                  </div>
                  {invoice.paid_amount > 0 && (
                    <>
                      <div className="flex justify-between text-sm" style={{ color: "var(--color-success)" }}>
                        <span>Déjà encaissé</span>
                        <span className="tabular-nums">-{fmt(invoice.paid_amount, currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Reste à payer</span>
                        <span className="tabular-nums" style={{ color: remaining > 0 ? "var(--color-danger)" : "var(--color-success)" }}>
                          {fmt(remaining, currency)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Notes */}
            {(invoice.notes || invoice.terms) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {invoice.notes && (
                  <Card padding="md">
                    <h3 className="text-xs font-semibold text-[var(--color-text-3)] uppercase mb-2">Notes</h3>
                    <p className="text-sm text-[var(--color-text-2)] whitespace-pre-wrap">{invoice.notes}</p>
                  </Card>
                )}
                {invoice.terms && (
                  <Card padding="md">
                    <h3 className="text-xs font-semibold text-[var(--color-text-3)] uppercase mb-2">Conditions</h3>
                    <p className="text-sm text-[var(--color-text-2)] whitespace-pre-wrap">{invoice.terms}</p>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Colonne latérale — métadonnées */}
          <div className="space-y-4">
            <Card padding="md">
              <h3 className="text-xs font-semibold text-[var(--color-text-3)] uppercase mb-3">Informations</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <Hash className="w-3.5 h-3.5 text-[var(--color-text-3)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[var(--color-text-3)]">Numéro</p>
                    <p className="font-mono text-sm font-medium text-[var(--color-accent)] truncate">{invoice.number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  {invoice.client?.type === "company"
                    ? <Building2 className="w-3.5 h-3.5 text-[var(--color-text-3)] shrink-0" />
                    : <User className="w-3.5 h-3.5 text-[var(--color-text-3)] shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-[11px] text-[var(--color-text-3)]">Client</p>
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{invoice.client?.name ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--color-text-3)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[var(--color-text-3)]">Émission</p>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {new Date(invoice.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--color-text-3)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[var(--color-text-3)]">Échéance</p>
                    <p className="text-sm font-medium" style={{
                      color: invoice.status === "overdue" ? "var(--color-danger)" : "var(--color-text)",
                    }}>
                      {new Date(invoice.due_date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {(profile?.bank_iban || profile?.bank_name) && (
              <Card padding="md">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-[var(--color-text-3)]" />
                  <h3 className="text-xs font-semibold text-[var(--color-text-3)] uppercase">Coordonnées bancaires</h3>
                </div>
                {profile.bank_name && <p className="text-sm text-[var(--color-text)]">{profile.bank_name}</p>}
                {profile.bank_iban && <p className="font-mono text-xs text-[var(--color-text-2)] mt-1 break-all">{profile.bank_iban}</p>}
                {profile.bank_bic && <p className="font-mono text-xs text-[var(--color-text-2)]">BIC : {profile.bank_bic}</p>}
              </Card>
            )}

            {invoice.payment_method && (
              <Card padding="md">
                <h3 className="text-xs font-semibold text-[var(--color-text-3)] uppercase mb-2">Paiement reçu</h3>
                <p className="text-sm font-medium text-[var(--color-success)]">{paymentMethodLabels[invoice.payment_method] ?? invoice.payment_method}</p>
                {invoice.paid_at && <p className="text-xs text-[var(--color-text-3)] mt-1">{new Date(invoice.paid_at).toLocaleDateString("fr-FR")}</p>}
              </Card>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
