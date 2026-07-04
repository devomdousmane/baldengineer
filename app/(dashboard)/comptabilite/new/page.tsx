"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { createAccountingEntryAction } from "@/lib/actions/accounting";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import type { Market } from "@/types/database";

const INCOME_CATEGORIES = [
  "facturation", "prestation", "vente", "remboursement", "subvention", "autre_recette",
];
const EXPENSE_CATEGORIES = [
  "materiel", "logiciels", "deplacement", "formation", "communication",
  "assurance", "comptabilite", "banque", "loyer", "salaires", "taxes", "autre_charge",
];
const categoryLabels: Record<string, string> = {
  facturation: "Facturation client", prestation: "Prestation de service",
  vente: "Vente de produit", remboursement: "Remboursement",
  subvention: "Subvention / aide", autre_recette: "Autre recette",
  materiel: "Matériel", logiciels: "Logiciels & abonnements",
  deplacement: "Déplacements", formation: "Formation",
  communication: "Communication & marketing", assurance: "Assurance",
  comptabilite: "Comptabilité & juridique", banque: "Frais bancaires",
  loyer: "Loyer & charges locatives", salaires: "Salaires & charges sociales",
  taxes: "Taxes & impôts", autre_charge: "Autre charge",
};

const today = new Date().toISOString().slice(0, 10);
const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const card = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, delay: i * 0.07, ease } },
});

export default function NewAccountingEntryPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<"income" | "expense">("income");
  const [market, setMarket] = useState<Market>("france");
  const [category, setCategory] = useState("");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const currency = market === "france" ? "EUR" : "GNF";

  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    setCategory("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) { setError("Veuillez sélectionner une catégorie"); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError("Montant invalide"); return; }
    setError(null);
    startTransition(async () => {
      try {
        await createAccountingEntryAction({
          market, type, category, label, amount: amt,
          date, reference: reference || undefined, notes: notes || undefined,
        });
        router.push("/comptabilite");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la création");
      }
    });
  };

  return (
    <>
      <Header
        title="Nouvelle écriture"
        subtitle="Enregistrez une recette ou une dépense"
        actions={
          <Link href="/comptabilite">
            <Button variant="ghost" size="sm" iconLeft={<ArrowLeft className="w-3.5 h-3.5" />}>
              Retour
            </Button>
          </Link>
        }
      />

      <PageWrapper>
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">

          {/* Type toggle */}
          <motion.div {...card(0)}>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange("income")}
                className="flex items-center gap-3 px-4 py-4 rounded-[var(--radius-xl)] border-2 transition-all"
                style={{
                  borderColor: type === "income" ? "var(--color-success)" : "var(--color-border)",
                  backgroundColor: type === "income" ? "var(--color-success-dim)" : "var(--color-card)",
                  color: type === "income" ? "var(--color-success)" : "var(--color-text-2)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 transition-colors"
                  style={{ backgroundColor: type === "income" ? "var(--color-success)" : "var(--color-bg-2)" }}
                >
                  <TrendingUp className="w-4 h-4" style={{ color: type === "income" ? "#fff" : "var(--color-text-3)" }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold font-heading">Recette</p>
                  <p className="text-xs opacity-70">Entrée d'argent</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("expense")}
                className="flex items-center gap-3 px-4 py-4 rounded-[var(--radius-xl)] border-2 transition-all"
                style={{
                  borderColor: type === "expense" ? "var(--color-danger)" : "var(--color-border)",
                  backgroundColor: type === "expense" ? "var(--color-danger-dim)" : "var(--color-card)",
                  color: type === "expense" ? "var(--color-danger)" : "var(--color-text-2)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 transition-colors"
                  style={{ backgroundColor: type === "expense" ? "var(--color-danger)" : "var(--color-bg-2)" }}
                >
                  <TrendingDown className="w-4 h-4" style={{ color: type === "expense" ? "#fff" : "var(--color-text-3)" }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold font-heading">Dépense</p>
                  <p className="text-xs opacity-70">Sortie d'argent</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Détails */}
          <motion.div {...card(1)}>
            <Card padding="lg">
              <h2 className="font-heading text-sm font-semibold text-[var(--color-text)] mb-4">Détails</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Marché" value={market} onChange={(e) => setMarket(e.target.value as Market)} required>
                    <option value="france">🇫🇷 France (EUR)</option>
                    <option value="guinee">🇬🇳 Guinée (GNF)</option>
                  </Select>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease } }}
                      exit={{ opacity: 0 }}
                    >
                      <Select
                        label="Catégorie"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="">Sélectionner…</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>{categoryLabels[c] ?? c}</option>
                        ))}
                      </Select>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <Input
                  label="Libellé"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={type === "income" ? "Paiement facture FAC-FR-0012" : "Achat MacBook Pro"}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={`Montant (${currency})`}
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                  <Input
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Référence (optionnel)"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="N° de reçu, facture fournisseur…"
                />
              </div>
            </Card>
          </motion.div>

          {/* Notes */}
          <motion.div {...card(2)}>
            <Card padding="lg">
              <Textarea
                label="Notes internes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informations complémentaires…"
                rows={2}
                hint="Visible uniquement pour vous"
              />
            </Card>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-sm text-[var(--color-danger)] px-1"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div {...card(3)} className="flex gap-3 pb-6">
            <Button type="submit" loading={isPending} className="flex-1">Enregistrer</Button>
            <Link href="/comptabilite">
              <Button type="button" variant="secondary">Annuler</Button>
            </Link>
          </motion.div>
        </form>
      </PageWrapper>
    </>
  );
}
