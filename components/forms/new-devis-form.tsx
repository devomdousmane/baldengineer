"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { DocumentPreviewFrame } from "@/components/modules/document-preview-frame";
import { QuickAddClientDialog } from "@/components/modules/quick-add-client-dialog";
import { createQuoteAction } from "@/lib/actions/quotes";
import { defaultVatRate } from "@/lib/vat";
import { Plus, Trash2, Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";
import type { Client, Market, Profile } from "@/types/database";

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
  profile?: Profile | null;
}

export function NewDevisForm({ clients: initialClients, defaultMarket, vatRateDefault, profile }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [addingClient, setAddingClient] = useState(false);

  const [market, setMarket] = useState<Market>(defaultMarket);
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [validUntil, setValidUntil] = useState(in30days);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { id: lineIdCounter++, description: "", quantity: 1, unit: "j", unit_price: 0, vat_rate: defaultVatRate(defaultMarket, vatRateDefault), discount_pct: 0 },
  ]);

  const filteredClients = clients.filter((c) => c.market === market || !c.market);
  const currency = market === "france" ? "EUR" : "GNF";
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
  const totals = calcTotals(lines);

  const selectedClient = filteredClients.find((c) => c.id === clientId) ?? null;
  const colTemplate = "1fr 64px 64px 88px 56px 48px 28px";

  const addLine = () =>
    setLines((prev) => [
      ...prev,
      { id: lineIdCounter++, description: "", quantity: 1, unit: "j", unit_price: 0, vat_rate: defaultVatRate(market, vatRateDefault), discount_pct: 0 },
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
    <div className="h-full flex flex-col">
      {/* ── Topbar ── */}
      <div
        className="flex items-center justify-between px-5 border-b border-[var(--color-border)] bg-[var(--color-card)] shrink-0"
        style={{ height: "var(--header-height)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/devis"
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-2)] hover:text-[var(--color-text)] transition-colors duration-[var(--dur-fast)]"
          >
            <ArrowLeft className="w-4 h-4" /> Devis
          </Link>
          <span className="text-[var(--color-text-3)]">/</span>
          <span className="text-sm font-semibold text-[var(--color-text)] truncate">Nouveau devis</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant={showPreview ? "secondary" : "outline"}
            size="sm"
            iconLeft={showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            onClick={() => setShowPreview((v) => !v)}
            className="hidden xl:inline-flex"
          >
            {showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
          </Button>
          <Button type="submit" form="new-devis-form" size="sm" loading={isPending}>
            Créer le devis
          </Button>
        </div>
      </div>

      {/* ── Corps : formulaire + aperçu ── */}
      <div className="flex-1 flex overflow-hidden">
        <form
          id="new-devis-form"
          onSubmit={handleSubmit}
          className={`w-full overflow-y-auto p-5 space-y-4 border-r border-[var(--color-border)] ${showPreview ? "xl:w-[560px] xl:shrink-0" : ""}`}
        >

        <motion.div {...card(0)}>
          <Card padding="lg">
            <h2 className="font-heading text-sm font-semibold text-[var(--color-text)] mb-4">Informations générales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Marché"
                value={market}
                onChange={(e) => {
                  const newMarket = e.target.value as Market;
                  setMarket(newMarket);
                  setClientId("");
                  setLines((prev) => prev.map((l) => ({ ...l, vat_rate: defaultVatRate(newMarket, vatRateDefault) })));
                }}
                required
              >
                <option value="france">🇫🇷 France</option>
                <option value="guinee">🇬🇳 Guinée</option>
              </Select>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                    <option value="">Sélectionner un client…</option>
                    {filteredClients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setAddingClient(true)}
                  aria-label="Nouveau client"
                  title="Nouveau client"
                  className="shrink-0 !px-2.5"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
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
              <span>TVA%</span>
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
                    {/* Mobile — champs empilés avec labels */}
                    <div className="sm:hidden rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 space-y-2">
                      <Input label="Description" value={line.description} onChange={(e) => updateLine(line.id, "description", e.target.value)} placeholder={`Prestation ${idx + 1}`} required />
                      <div className="grid grid-cols-2 gap-2">
                        <Input label="Qté" type="number" value={line.quantity} onChange={(e) => updateLine(line.id, "quantity", e.target.value)} min="0" step="0.01" />
                        <Input label="Unité" value={line.unit} onChange={(e) => updateLine(line.id, "unit", e.target.value)} placeholder="j" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input label="PU HT" type="number" value={line.unit_price} onChange={(e) => updateLine(line.id, "unit_price", e.target.value)} min="0" step="0.01" />
                        <Input label="TVA%" type="number" value={line.vat_rate} onChange={(e) => updateLine(line.id, "vat_rate", e.target.value)} min="0" max="100" step="0.1" />
                      </div>
                      <Input label="Rem%" type="number" value={line.discount_pct} onChange={(e) => updateLine(line.id, "discount_pct", e.target.value)} min="0" max="100" step="0.1" />
                      <button
                        type="button" onClick={() => removeLine(line.id)} disabled={lines.length === 1}
                        className="w-full h-9 flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] text-xs text-[var(--color-text-3)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-dim)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer la ligne
                      </button>
                    </div>

                    {/* Desktop/tablette — ligne en grille compacte */}
                    <div className="hidden sm:grid gap-2 items-start" style={{ gridTemplateColumns: colTemplate }}>
                      <Input value={line.description} onChange={(e) => updateLine(line.id, "description", e.target.value)} placeholder={`Prestation ${idx + 1}`} required />
                      <Input type="number" value={line.quantity} onChange={(e) => updateLine(line.id, "quantity", e.target.value)} min="0" step="0.01" />
                      <Input value={line.unit} onChange={(e) => updateLine(line.id, "unit", e.target.value)} placeholder="j" />
                      <Input type="number" value={line.unit_price} onChange={(e) => updateLine(line.id, "unit_price", e.target.value)} min="0" step="0.01" />
                      <Input type="number" value={line.vat_rate} onChange={(e) => updateLine(line.id, "vat_rate", e.target.value)} min="0" max="100" step="0.1" />
                      <Input type="number" value={line.discount_pct} onChange={(e) => updateLine(line.id, "discount_pct", e.target.value)} min="0" max="100" step="0.1" />
                      <button
                        type="button" onClick={() => removeLine(line.id)} disabled={lines.length === 1}
                        className="w-7 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-3)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-dim)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-3xs text-[var(--color-text-3)] mt-1 text-right pr-0 sm:pr-7">
                      HT : {fmt(ht)} · TTC : {fmt(Math.round(ht * (1 + line.vat_rate / 100) * 100) / 100)}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Totaux */}
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex flex-col items-end gap-1 text-sm">
              <div className="flex gap-8 text-[var(--color-text-2)]"><span>Total HT</span><span className="tabular-nums font-medium text-[var(--color-text)] w-28 text-right">{fmt(totals.ht)}</span></div>
              <div className="flex gap-8 text-[var(--color-text-2)]"><span>TVA</span><span className="tabular-nums font-medium text-[var(--color-text)] w-28 text-right">{fmt(totals.vat)}</span></div>
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

        <motion.div {...card(3)} className="flex gap-3 pb-6 xl:hidden">
          <Button type="submit" loading={isPending} className="flex-1">Créer le devis</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/devis")}>Annuler</Button>
        </motion.div>
        </form>

        {/* ── Right: Live preview (escamotable) ── */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.25, ease }}
              className="hidden xl:flex flex-col flex-1 overflow-hidden p-6 bg-[var(--color-bg)]"
            >
              <p className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-3)] mb-4 shrink-0">
                <Eye className="w-3.5 h-3.5" /> Aperçu en temps réel
              </p>
              <DocumentPreviewFrame
                type="devis"
                document={{
                  number: "—",
                  title,
                  date,
                  dateLabel: "Date du devis",
                  extraDate: validUntil,
                  extraDateLabel: "Valable jusqu'au",
                  status: "draft",
                  market,
                  currency,
                  subtotal_ht: totals.ht,
                  total_vat: totals.vat,
                  total_ttc: totals.ttc,
                  notes: notes || undefined,
                  terms: terms || undefined,
                  lines: lines.map((l, i) => ({
                    position: i + 1,
                    description: l.description,
                    quantity: l.quantity,
                    unit: l.unit,
                    unit_price: l.unit_price,
                    vat_rate: l.vat_rate,
                    discount_pct: l.discount_pct,
                  })),
                }}
                client={selectedClient}
                profile={profile ?? null}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <QuickAddClientDialog
        open={addingClient}
        onClose={() => setAddingClient(false)}
        market={market}
        onCreated={(client) => {
          setClients((prev) => [...prev, client]);
          setClientId(client.id);
        }}
      />
    </div>
  );
}
