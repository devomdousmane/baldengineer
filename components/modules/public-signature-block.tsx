"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignaturePad } from "@/components/ui/signature-pad";
import { signQuoteAction, signInvoiceAction } from "@/lib/actions/signatures";

interface Props {
  type: "devis" | "facture";
  token: string;
  alreadySigned: boolean;
  signedAt: string | null;
  signerName: string | null;
  signatureDataUrl: string | null;
  defaultSignerName?: string;
}

export function PublicSignatureBlock({ type, token, alreadySigned, signedAt, signerName, signatureDataUrl, defaultSignerName }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultSignerName ?? "");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (alreadySigned || done) {
    return (
      <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-success)]/30 bg-[var(--color-success-dim)] p-4">
        <CheckCircle2 className="w-5 h-5 shrink-0 text-[var(--color-success)]" />
        <div>
          <p className="text-sm font-semibold text-[var(--color-success)]">
            {type === "devis" ? "Devis accepté et signé" : "Facture signée"}
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

  const handleSubmit = () => {
    if (!name.trim()) { setError("Votre nom est requis"); return; }
    if (!dataUrl) { setError("Veuillez signer avant de valider"); return; }
    setError(null);
    startTransition(async () => {
      try {
        if (type === "devis") await signQuoteAction(token, dataUrl, name);
        else await signInvoiceAction(token, dataUrl, name);
        setDone(true);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la signature");
      }
    });
  };

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-2)] p-4">
      {!open ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--color-text-2)]">
            {type === "devis" ? "Vous acceptez ce devis ?" : "Accuser réception de cette facture"}
          </p>
          <Button size="sm" iconLeft={<PenLine className="w-3.5 h-3.5" />} onClick={() => setOpen(true)}>
            Signer
          </Button>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <Input
              label="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom et prénom"
              error={error && !dataUrl ? undefined : error ?? undefined}
              required
            />
            <SignaturePad onChange={setDataUrl} />
            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" loading={isPending} onClick={handleSubmit} className="flex-1">
                Valider la signature
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setOpen(false)} disabled={isPending}>
                Annuler
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
