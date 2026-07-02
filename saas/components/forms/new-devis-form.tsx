"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { DocPreview, type PreviewProfile } from "@/components/modules/doc-preview";
import { createQuoteAction } from "@/lib/actions/quotes";
import { Plus, Trash2, Eye } from "lucide-react";
import type { Client, Market } from "@/types/database";

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
  discount_pct: number;
}

function calcTotals(lines: LineItem[]) {
  let ht = 0, vat = 0;
  for (const l of lines) {
    const lineHt = Math.round(l.quantity * l.unit_price * (1 - l.discount_pct / 100) * 100) / 100;
    vat += Math.round(lineHt * l.vat_rate / 100 * 100) / 100;
    ht += lineHt;
  }
  return { ht: Math.round(ht * 100) / 100, vat: Math.round(vat * 100) / 100, ttc: Math.round((ht + vat) * 100) / 100 };
}

let lineIdCounter = 1;
const today = new Date().toISOString().slice(0, 10);
const in30days = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const card = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, delay: i * 0.07, ease } },
});

interface Props {
  clients: Client[];
  defaultMarket: Market;
  vatRateDefault: number;
  previewProfile?: PreviewProfile | null;
}

export function NewDevisForm({ clients, defaultMarket, vatRateDefault, previewProfile }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [market, setMarket] = useState<Market>(defaultMarket);
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [validUntil, setValidUntil] = useState(in30days);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { id: lineIdCounter++, description: "", quantity: 1, unit: "j", unit_price: 0, vat_rate: vatRateDefault, discount_pct: 0 },
  ]);

  const filteredClients = clients.filter((c) => c.market === market || !c.market);
  const currency = market === "france" ? "EUR" : "GNF";
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
  const totals = calcTotals(lines);

  const selectedClient = filteredClients.find((c) => c.id === clientId) ?? null;
  const colTemplate = market === "france"
    ? "1fr 64px 64px 88px 56px 48px 28px"
    : "1fr 64px 64px 88px 48px 28px";

  const addLine = () =>
    setLines((prev) => [
      ...prev,
      { id: lineIdCounter++, description: "", quantity: 1, unit: "j", unit_price: 0, vat_rate: market === "france" ? vatRateDefault : 0, discount_pct: 0 },
    ]);

  const removeLine = (id: number) => setLines((prev) => prev.filter((l) => l.id !== id));

  const updateLine = (id: number, field: keyof Omit<LineItem, "id">, value: string | number) =>
    setLines((prev) =>
      prev.map((l) => l.id === id
        ? { ...l, [field]: typeof value === "string" && field !== "description" && field !== "unit" ? parseFloat(value) || 0 : value }
        : l
      )
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) { setError("Veuillez sélectionner un client"); return; }
    if (lines.some((l) => !l.description.trim())) { setError("Toutes les lignes doivent avoir une description"); return; }
    setError(null);
    startTransition(async () => {
      try {
        await createQuoteAction({
          client_id: clientId, market, title, date, valid_until: validUntil,
          notes: notes || undefined, terms: terms || undefined,
          lines: lines.map((l, i) => ({
            position: i + 1, description: l.description, quantity: l.quantity,
            unit: l.unit, unit_price: l.unit_price, vat_rate: l.vat_rate, discount_pct: l.discount_pct,
          })),
        });
        router.push("/devis");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la création");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
      {/* ── Left: Form ── */}
      <form onSubmit={handleSubmit} className="space-y-5">

        <motion.div {...card(0)}>
          <Card padding="lg">
            <h2 className="font-heading text-sm font-semibold text-[var(--color-text)] mb-4">Informations générales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Marché" value={market} onChange={(e) => { setMarket(e.target.value as Market); setClientId(""); }} required>
                <option value="france">🇫🇷 France</option>
                <option value="guinee">🇬🇳 Guinée</option>
              </Select>
              <Select label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                <option value="">Sélectionner un client…</option>
                {filteredClients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </Select>
              <Input label="Titre du devis" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mission CFO — Site industriel" required className="col-span-full" />
              <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              <Input label="Valide jusqu'au" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required />
            </div>
          </Card>
        </motion.div>

        <motion.div {...card(1)}>
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-sm font-semibold text-[var(--color-text)]">Prestations</h2>
              <Button type="button" variant="secondary" size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />} onClick={addLine}>Ajouter</Button>
            </div>

            <div className="hidden sm:grid gap-2 text-xs font-medium text-[var(--color-text-3)] pb-2 border-b border-[var(--color-border)] mb-3" style={{ gridTemplateColumns: colTemplate }}>
              <span>Description</span><span>Qté</span><span>Unité</span><span>PU HT</span>
              {market === "france" && <span>TVA%</span>}
              <span>Rem%</span><span />
            </div>

            <AnimatePresence initial={false}>
              {lines.map((line, idx) => {
                const ht = Math.round(line.quantity * line.unit_price * (1 - line.discount_pct / 100) * 100) / 100;
                return (
                  <motion.div
                    key={line.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease } }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.16 } }}
                    className="mb-3"
                  >
                    <div className="grid gap-2 items-start" style={{ gridTemplateColumns: colTemplate }}>
                      <Input value={line.description} onChange={(e) => updateLine(line.id, "description", e.target.value)} placeholder={`Prestation ${idx + 1}`} required />
                      <Input type="number" value={line.quantity} onChange={(e) => updateLine(line.id, "quantity", e.target.value)} min="0" step="0.01" />
                      <Input value={line.unit} onChange={(e) => updateLine(line.id, "unit", e.target.value)} placeholder="j" />
                      <Input type="number" value={line.unit_price} onChange={(e) => updateLine(line.id, "unit_price", e.target.value)} min="0" step="0.01" />
                      {market === "france" && (
                        <Input type="number" value={line.vat_rate} onChange={(e) => updateLine(line.id, "vat_rate", e.target.value)} min="0" max="100" step="0.1" />
                      )}
                      <Input type="number" value={line.discount_pct} onChange={(e) => updateLine(line.id, "discount_pct", e.target.value)} min="0" max="100" step="0.1" />
                      <button
                        type="button" onClick={() => removeLine(line.id)} disabled={lines.length === 1}
                        className="w-7 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-3)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-dim)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-3)] mt-1 text-right pr-7">
                      HT : {fmt(ht)}{market === "france" ? ` · TTC : ${fmt(Math.round(ht * (1 + line.vat_rate / 100) * 100) / 100)}` : ""}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Totaux */}
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex flex-col items-end gap-1 text-sm">
              <div className="flex gap-8 text-[var(--color-text-2)]"><span>Total HT</span><span className="tabular-nums font-medium text-[var(--color-text)] w-28 text-right">{fmt(totals.ht)}</span></div>
              {market === "france" && <div className="flex gap-8 text-[var(--color-text-2)]"><span>TVA</span><span className="tabular-nums font-medium text-[var(--color-text)] w-28 text-right">{fmt(totals.vat)}</span></div>}
              <div className="flex gap-8 font-semibold text-base border-t border-[var(--color-border)] pt-2 mt-1">
                <span>Total TTC</span>
                <span className="tabular-nums text-[var(--color-accent)] w-28 text-right">{fmt(totals.ttc)}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div {...card(2)}>
          <Card padding="lg">
            <h2 className="font-heading text-sm font-semibold text-[var(--color-text)] mb-4">Notes et conditions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Remarques pour le client…" rows={3} />
              <Textarea label="Conditions" value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Délais de paiement, CGV…" rows={3} />
            </div>
          </Card>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-[var(--color-danger)] px-1">{error}</motion.p>
          )}
        </AnimatePresence>

        <motion.div {...card(3)} className="flex gap-3 pb-6">
          <Button type="submit" loading={isPending} className="flex-1">Créer le devis</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/devis")}>Annuler</Button>
        </motion.div>
      </form>

      {/* ── Right: Live preview ── */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.15, ease } }}
        className="hidden xl:block"
        style={{ position: "sticky", top: "calc(var(--header-height) + 1.5rem)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-3.5 h-3.5 text-[var(--color-text-3)]" />
          <p className="text-xs font-medium text-[var(--color-text-3)]">Aperçu temps réel</p>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - var(--header-height) - 5rem)" }}>
          <DocPreview
            type="devis"
            title={title}
            date={date}
            extraDate={validUntil}
            extraDateLabel="Valable jusqu'au"
            market={market}
            currency={currency}
            lines={lines}
            notes={notes}
            terms={terms}
            client={selectedClient ? { name: selectedClient.name, address: selectedClient.address, city: selectedClient.city, zip: selectedClient.zip, siren: selectedClient.siren, nif: selectedClient.nif, vat_number: selectedClient.vat_number } : null}
            profile={previewProfile}
          />
        </div>
      </motion.div>
    </div>
  );
}
