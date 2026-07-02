"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmailDialog } from "@/components/modules/email-dialog";
import { updateQuoteStatusAction, convertQuoteToInvoiceAction } from "@/lib/actions/quotes";
import { Send, CheckCircle, XCircle, Clock, FileText, Mail, RefreshCw } from "lucide-react";
import type { Quote } from "@/types/database";

interface DevisActionsProps {
  quote: Quote & { client?: { name?: string; email?: string | null } | null };
  canConvert: boolean;
}

export function DevisActions({ quote, canConvert }: DevisActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  type DialogType = "devis_envoye" | "devis_relance";
  const [emailDialog, setEmailDialog] = useState<DialogType | null>(null);

  const act = (fn: () => Promise<void>) => {
    setError(null);
    startTransition(async () => {
      try { await fn(); router.refresh(); }
      catch (e) { setError(e instanceof Error ? e.message : "Erreur"); }
    });
  };

  const convert = () => {
    setError(null);
    startTransition(async () => {
      try {
        const { invoiceId } = await convertQuoteToInvoiceAction(quote.id);
        router.push(`/factures/${invoiceId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  };

  const s = quote.status;
  const clientEmail = quote.client?.email ?? "";
  const validUntilStr = quote.valid_until
    ? new Date(quote.valid_until).toLocaleDateString("fr-FR")
    : undefined;

  return (
    <div className="flex flex-col items-start gap-2">
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}

      <div className="flex items-center gap-2 flex-wrap">

        {/* Send email (also marks as "sent") */}
        {(s === "draft" || s === "sent") && (
          <Button size="sm" variant={s === "draft" ? "primary" : "outline"}
            iconLeft={<Mail className="w-3.5 h-3.5" />}
            onClick={() => setEmailDialog("devis_envoye")}>
            Envoyer par email
          </Button>
        )}

        {/* Mark sent (status only, no email) */}
        {s === "draft" && (
          <Button size="sm" variant="ghost" iconLeft={<Send className="w-3.5 h-3.5" />}
            loading={isPending} onClick={() => act(() => updateQuoteStatusAction(quote.id, "sent"))}>
            Marquer envoyé
          </Button>
        )}

        {/* Expiry reminder */}
        {s === "sent" && (
          <Button size="sm" variant="outline" iconLeft={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => setEmailDialog("devis_relance")}>
            Relancer client
          </Button>
        )}

        {/* Accept / refuse / expire */}
        {s === "sent" && (
          <>
            <Button size="sm" variant="outline" iconLeft={<CheckCircle className="w-3.5 h-3.5" />}
              loading={isPending} onClick={() => act(() => updateQuoteStatusAction(quote.id, "accepted"))}
              className="text-[var(--color-success)] border-[var(--color-success)] hover:bg-[var(--color-success-dim)]">
              Accepté
            </Button>
            <Button size="sm" variant="outline" iconLeft={<XCircle className="w-3.5 h-3.5" />}
              loading={isPending} onClick={() => act(() => updateQuoteStatusAction(quote.id, "refused"))}
              className="text-[var(--color-danger)] border-[var(--color-danger)] hover:bg-[var(--color-danger-dim)]">
              Refusé
            </Button>
            <Button size="sm" variant="ghost" iconLeft={<Clock className="w-3.5 h-3.5" />}
              loading={isPending} onClick={() => act(() => updateQuoteStatusAction(quote.id, "expired"))}>
              Expiré
            </Button>
          </>
        )}

        {/* Convert to invoice */}
        {canConvert && (
          <Button size="sm" iconLeft={<FileText className="w-3.5 h-3.5" />}
            loading={isPending} onClick={convert}>
            Convertir en facture
          </Button>
        )}
      </div>

      {/* ── Email dialogs ── */}
      {emailDialog === "devis_envoye" && (
        <EmailDialog open onClose={() => setEmailDialog(null)} onSent={() => router.refresh()}
          config={{
            type: "devis_envoye",
            resourceId: quote.id,
            defaultTo: clientEmail,
            defaultSubject: `Devis ${quote.number}${quote.title ? ` — ${quote.title}` : ""}`,
            defaultMessage: validUntilStr
              ? `Bonjour,\n\nVeuillez trouver ci-joint votre devis ${quote.number}.\nCe devis est valable jusqu'au ${validUntilStr}.\n\nN'hésitez pas à me contacter pour toute question.`
              : undefined,
          }} />
      )}

      {emailDialog === "devis_relance" && (
        <EmailDialog open onClose={() => setEmailDialog(null)}
          config={{
            type: "devis_relance",
            resourceId: quote.id,
            defaultTo: clientEmail,
            defaultSubject: `Rappel — Devis ${quote.number}${validUntilStr ? ` (valable jusqu'au ${validUntilStr})` : ""}`,
          }} />
      )}
    </div>
  );
}
