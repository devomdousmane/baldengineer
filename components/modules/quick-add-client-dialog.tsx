"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { createClientAction } from "@/lib/actions/clients";
import type { Client, Market } from "@/types/database";

interface Props {
  open: boolean;
  onClose: () => void;
  market: Market;
  onCreated: (client: Client) => void;
}

/**
 * Création rapide d'un client sans quitter le formulaire de devis/facture — seuls les
 * champs indispensables sont proposés ici ; l'édition complète reste sur /clients/[id]/edit.
 */
export function QuickAddClientDialog({ open, onClose, market, onCreated }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"company" | "individual">("company");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) { setName(""); setType("company"); setEmail(""); setPhone(""); setError(null); }
  }, [open]);
  useFocusTrap(dialogRef, { open, onEscape: onClose, initialFocusRef: nameRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Le nom du client est requis"); return; }
    setError(null);
    setIsPending(true);
    try {
      const { id } = await createClientAction({
        name: name.trim(),
        type,
        market,
        country: market === "france" ? "France" : "Guinée",
        email: email.trim() || null,
        phone: phone.trim() || null,
        address: null, city: null, zip: null,
        siren: null, nif: null, vat_number: null, notes: null,
      });
      onCreated({
        id, name: name.trim(), type, market,
        country: market === "france" ? "France" : "Guinée",
        email: email.trim() || null, phone: phone.trim() || null,
        address: null, city: null, zip: null, siren: null, nif: null, vat_number: null, notes: null,
        is_active: true, user_id: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
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
            aria-label="Nouveau client"
            className="w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-xl)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Nouveau client</h2>
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
                ref={nameRef}
                label="Nom du client"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Sanofi SA"
                error={error ?? undefined}
                required
              />
              <Select label="Type" value={type} onChange={(e) => setType(e.target.value as "company" | "individual")}>
                <option value="company">Entreprise</option>
                <option value="individual">Particulier</option>
              </Select>
              <Input label="Email (optionnel)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@exemple.com" />
              <Input label="Téléphone (optionnel)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 XX XX XX XX" />
              <p className="text-xs text-[var(--color-text-3)]">
                Adresse, SIREN/NIF et autres détails pourront être ajoutés ensuite depuis la fiche client.
              </p>
              <Button type="submit" size="sm" className="w-full" loading={isPending}>
                Créer et sélectionner
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
