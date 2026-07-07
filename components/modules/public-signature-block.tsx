"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, CheckCircle2, XCircle, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { SignaturePad } from "@/components/ui/signature-pad";
import { signQuoteAction, signInvoiceAction, refuseQuoteAction } from "@/lib/actions/signatures";

interface Props {
  type: "devis" | "facture";
  token: string;
  alreadySigned: boolean;
  signedAt: string | null;
  signerName: string | null;
  signatureDataUrl: string | null;
  defaultSignerName?: string;
  /** Devis uniquement — déjà refusé, avec le motif enregistré. */
  alreadyRefused?: boolean;
  refusedAt?: string | null;
  refusalReason?: string | null;
}

type Mode = "idle" | "signing" | "refusing";

export function PublicSignatureBlock({
  type, token, alreadySigned, signedAt, signerName, signatureDataUrl, defaultSignerName,
  alreadyRefused, refusedAt, refusalReason,
}: Props) {
  const [mode, setMode] = useState<Mode>("idle");
  const [name, setName] = useState(defaultSignerName ?? "");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<"signed" | "refused" | null>(null);

  const isDevis = type === "devis";

  if (alreadySigned || done === "signed") {
    return (
      <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-success)]/30 bg-[var(--color-success-dim)] p-4 sm:p-5">
        <CheckCircle2 className="w-5 h-5 shrink-0 text-[var(--color-success)] mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-success)]">
            {isDevis ? "Devis accepté et signé" : "Facture signée"}
          </p>
          {signerName && (
            <p className="text-xs text-[var(--color-text-2)] mt-0.5">
              Par {signerName}{signedAt && ` · ${new Date(signedAt).toLocaleString("fr-FR")}`}
            </p>
          )}
          {signatureDataUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={signatureDataUrl} alt="Signature" className="h-16 mt-2" style={{ objectFit: "contain" }} />
          )}
        </div>
      </div>
    );
  }

  if ((isDevis && alreadyRefused) || done === "refused") {
    return (
      <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-dim)] p-4 sm:p-5">
        <XCircle className="w-5 h-5 shrink-0 text-[var(--color-danger)] mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-danger)]">Devis refusé</p>
          {refusedAt && (
            <p className="text-xs text-[var(--color-text-2)] mt-0.5">{new Date(refusedAt).toLocaleString("fr-FR")}</p>
          )}
          {(refusalReason || reason) && (
            <p className="text-xs text-[var(--color-text-2)] mt-2 whitespace-pre-wrap">« {refusalReason || reason} »</p>
          )}
        </div>
      </div>
    );
  }

  const handleSign = () => {
    if (!name.trim()) { setError("Votre nom est requis"); return; }
    if (!dataUrl) { setError("Veuillez signer avant de valider"); return; }
    setError(null);
    startTransition(async () => {
      try {
        if (isDevis) await signQuoteAction(token, dataUrl, name);
        else await signInvoiceAction(token, dataUrl, name);
        setDone("signed");
        setMode("idle");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la signature");
      }
    });
  };

  const handleRefuse = () => {
    if (!reason.trim()) { setError("Merci de préciser le motif du refus"); return; }
    setError(null);
    startTransition(async () => {
      try {
        await refuseQuoteAction(token, reason);
        setDone("refused");
        setMode("idle");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de l'envoi du refus");
      }
    });
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-2)] p-4 sm:p-5">
      {mode === "idle" && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 sm:justify-between">
          <p className="text-sm text-[var(--color-text-2)]">
            {isDevis ? "Vous acceptez ce devis ?" : "Accuser réception de cette facture"}
          </p>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0">
            {isDevis && (
              <Button size="sm" variant="secondary" iconLeft={<ThumbsDown className="w-3.5 h-3.5" />} onClick={() => { setMode("refusing"); setError(null); }}>
                Refuser
              </Button>
            )}
            <Button size="sm" iconLeft={<PenLine className="w-3.5 h-3.5" />} onClick={() => { setMode("signing"); setError(null); }}>
              Signer
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {mode === "signing" && (
          <motion.div
            key="signing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 overflow-hidden"
          >
            <div className="space-y-3">
              <Input
                label="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom et prénom"
                required
              />
              <p className="text-xs text-[var(--color-text-3)] leading-relaxed">
                En signant, vous {isDevis ? "acceptez ce devis" : "accusez réception de cette facture"} tel que présenté ci-dessus. Votre signature et l&apos;horodatage seront conservés avec le document.
              </p>
            </div>
            <div className="space-y-3">
              <SignaturePad onChange={setDataUrl} />
            </div>
            {error && <p className="md:col-span-2 text-sm text-[var(--color-danger)]">{error}</p>}
            <div className="md:col-span-2 flex gap-2">
              <Button size="sm" loading={isPending} onClick={handleSign} className="flex-1">
                Valider la signature
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setMode("idle")} disabled={isPending}>
                Annuler
              </Button>
            </div>
          </motion.div>
        )}

        {mode === "refusing" && (
          <motion.div
            key="refusing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <Textarea
              label="Motif du refus"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez pourquoi ce devis ne vous convient pas…"
              rows={3}
              required
            />
            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" variant="danger" loading={isPending} onClick={handleRefuse} className="flex-1">
                Confirmer le refus
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setMode("idle")} disabled={isPending}>
                Annuler
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
