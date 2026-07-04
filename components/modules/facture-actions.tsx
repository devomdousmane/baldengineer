"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmailDialog } from "@/components/modules/email-dialog";
import { markInvoicePaidAction, updateInvoiceStatusAction, submitFacturXAction } from "@/lib/actions/invoices";
import { Send, CheckCircle, XCircle, Euro, Mail, Bell, AlertTriangle } from "lucide-react";
import type { Invoice, PaymentMethod } from "@/types/database";

interface FactureActionsProps {
  invoice: Invoice & { client?: { name?: string; email?: string | null } | null };
  canPay: boolean;
  remaining: number;
}

export function FactureActions({ invoice, canPay, remaining }: FactureActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount] = useState(String(Math.round(remaining * 100) / 100));
  const [payMethod, setPayMethod] = useState<PaymentMethod>("virement");
  const [showRelanceMenu, setShowRelanceMenu] = useState(false);

  type DialogType = "facture_envoyee" | "relance_paiement" | "paiement_recu";
  const [emailDialog, setEmailDialog] = useState<{ type: DialogType; level?: 1 | 2 | 3 } | null>(null);

  const act = (fn: () => Promise<void>) => {
    setError(null);
    startTransition(async () => {
      try { await fn(); router.refresh(); }
      catch (e) { setError(e instanceof Error ? e.message : "Erreur"); }
    });
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) { setError("Montant invalide"); return; }
    act(async () => {
      await markInvoicePaidAction(invoice.id, amount, payMethod);
      setShowPayForm(false);
    });
  };

  const daysLate = invoice.due_date
    ? Math.max(0, Math.floor((Date.now() - new Date(invoice.due_date).getTime()) / 86_400_000))
    : 0;

  const s = invoice.status;
  const clientEmail = invoice.client?.email ?? "";
  const clientName = invoice.client?.name ?? "Client";

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}

      <div className="flex items-center gap-2 flex-wrap justify-end">

        {/* Mark sent (no email) */}
        {s === "draft" && (
          <Button size="sm" variant="outline" iconLeft={<Send className="w-3.5 h-3.5" />}
            loading={isPending} onClick={() => act(() => updateInvoiceStatusAction(invoice.id, "sent"))}>
            Marquer envoyée
          </Button>
        )}

        {/* Send by email (also marks as sent) */}
        {(s === "draft" || s === "sent") && (
          <Button size="sm" variant={s === "draft" ? "primary" : "outline"}
            iconLeft={<Mail className="w-3.5 h-3.5" />}
            onClick={() => setEmailDialog({ type: "facture_envoyee" })}>
            Envoyer par email
          </Button>
        )}

        {/* Payment reminders dropdown */}
        {(s === "sent" || s === "overdue") && (
          <div className="relative">
            <Button size="sm" variant="outline" iconLeft={<Bell className="w-3.5 h-3.5" />}
              onClick={() => setShowRelanceMenu((v) => !v)}>
              Relancer
            </Button>
            {showRelanceMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowRelanceMenu(false)} />
                <div className="absolute right-0 top-full mt-1 flex flex-col bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-20 min-w-[190px] overflow-hidden">
                  {([
                    { label: "1ère relance", level: 1 as const },
                    { label: "2ème relance", level: 2 as const },
                    { label: "Mise en demeure", level: 3 as const, danger: true },
                  ]).map(({ label, level, danger }) => (
                    <button
                      key={level}
                      onClick={() => { setShowRelanceMenu(false); setEmailDialog({ type: "relance_paiement", level }); }}
                      className={`flex items-center gap-2 px-3 py-2.5 text-xs text-left transition-colors duration-[var(--dur-fast)] cursor-pointer hover:bg-[var(--color-bg-2)] ${danger ? "text-[var(--color-danger)]" : "text-[var(--color-text)]"}`}
                    >
                      {danger
                        ? <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-danger)] shrink-0" />
                        : <Mail className="w-3.5 h-3.5 text-[var(--color-text-3)] shrink-0" />}
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Payment confirmation email */}
        {(s === "paid" || s === "partial") && (
          <Button size="sm" variant="outline" iconLeft={<Mail className="w-3.5 h-3.5" />}
            onClick={() => setEmailDialog({ type: "paiement_recu" })}>
            Confirmer paiement
          </Button>
        )}

        {/* Register payment */}
        {(s === "sent" || s === "partial" || s === "overdue") && canPay && (
          <Button size="sm" iconLeft={<Euro className="w-3.5 h-3.5" />}
            onClick={() => setShowPayForm((v) => !v)}>
            Enregistrer paiement
          </Button>
        )}

        {s !== "cancelled" && s !== "paid" && (
          <Button size="sm" variant="danger" iconLeft={<XCircle className="w-3.5 h-3.5" />}
            loading={isPending} onClick={() => act(() => updateInvoiceStatusAction(invoice.id, "cancelled"))}>
            Annuler
          </Button>
        )}

        {invoice.market === "france" && s === "sent" && (!invoice.facturx_status || invoice.facturx_status === "none") && (
          <Button size="sm" variant="outline" loading={isPending}
            onClick={() => act(() => submitFacturXAction(invoice.id))}>
            Soumettre Factur-X
          </Button>
        )}
      </div>

      {/* Pay form */}
      {showPayForm && (
        <Card padding="md" className="w-72">
          <form onSubmit={handlePay} className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--color-text)]">Enregistrer un paiement</h3>
            <Input
              label={`Montant (${invoice.currency})`}
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              min="0.01" step="0.01" required
            />
            <Select label="Mode de paiement" value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}>
              <option value="virement">Virement bancaire</option>
              <option value="cheque">Chèque</option>
              <option value="especes">Espèces</option>
              <option value="carte">Carte bancaire</option>
              <option value="autre">Autre</option>
            </Select>
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={isPending} iconLeft={<CheckCircle className="w-3.5 h-3.5" />} className="flex-1">Confirmer</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowPayForm(false)}>Annuler</Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Email dialogs ── */}
      {emailDialog?.type === "facture_envoyee" && (
        <EmailDialog open onClose={() => setEmailDialog(null)} onSent={() => router.refresh()}
          config={{ type: "facture_envoyee", resourceId: invoice.id, defaultTo: clientEmail, defaultSubject: `Facture ${invoice.number}` }} />
      )}

      {emailDialog?.type === "relance_paiement" && (
        <EmailDialog open onClose={() => setEmailDialog(null)}
          config={{
            type: "relance_paiement",
            resourceId: invoice.id,
            defaultTo: clientEmail,
            defaultSubject: emailDialog.level === 3
              ? `MISE EN DEMEURE — Facture ${invoice.number}`
              : `${emailDialog.level === 2 ? "2ème relance" : "Rappel"} — Facture ${invoice.number}`,
            extra: { level: emailDialog.level ?? 1, daysLate },
          }} />
      )}

      {emailDialog?.type === "paiement_recu" && (
        <EmailDialog open onClose={() => setEmailDialog(null)}
          config={{
            type: "paiement_recu",
            resourceId: invoice.id,
            defaultTo: clientEmail,
            defaultSubject: `Confirmation de paiement — ${invoice.number}`,
            defaultMessage: `Bonjour ${clientName}, nous vous confirmons la bonne réception de votre paiement. Merci pour votre confiance.`,
          }} />
      )}
    </div>
  );
}
