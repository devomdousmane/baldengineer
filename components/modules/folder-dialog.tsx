"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFocusTrap } from "@/lib/use-focus-trap";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  title: string;
  initialName?: string;
  submitLabel?: string;
  /** Libellé du champ — "Nom du dossier" par défaut, adaptable (ex. "Nom du fichier"). */
  fieldLabel?: string;
}

/** Modale générique pour créer/renommer un dossier ou renommer un fichier — rendue en portail (voir upload-file-dialog). */
export function FolderDialog({ open, onClose, onSubmit, title, initialName = "", submitLabel = "Créer", fieldLabel = "Nom du dossier" }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (open) setName(initialName); }, [open, initialName]);
  useFocusTrap(dialogRef, { open, onEscape: onClose, initialFocusRef: inputRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError(`${fieldLabel} est requis`); return; }
    setError(null);
    setIsPending(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsPending(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={isPending ? undefined : onClose}
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="w-full max-w-sm rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-xl)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">{title}</h2>
              <button
                onClick={onClose}
                disabled={isPending}
                aria-label="Fermer"
                className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                ref={inputRef}
                label={fieldLabel}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Factures fournisseurs"
                error={error ?? undefined}
                autoFocus
              />
              <Button type="submit" size="sm" className="w-full" loading={isPending}>
                {submitLabel}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
