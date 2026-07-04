"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { createMissionAction } from "@/lib/actions/missions";
import { getClients } from "@/lib/actions/clients";
import { ArrowLeft, Briefcase, Calculator } from "lucide-react";
import Link from "next/link";
import type { Client, Market } from "@/types/database";

const today = new Date().toISOString().slice(0, 10);
const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const card = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, delay: i * 0.07, ease } },
});

export default function NewMissionPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  const [market, setMarket] = useState<Market>("france");
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    getClients().then(setClients).catch(console.error);
  }, []);

  const filteredClients = clients.filter((c) => c.market === market);
  const currency = market === "france" ? "EUR" : "GNF";

  const estimatedTotal =
    dailyRate && estimatedDays
      ? parseFloat(dailyRate) * parseFloat(estimatedDays)
      : null;

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) { setError("Veuillez sélectionner un client"); return; }
    setError(null);
    startTransition(async () => {
      try {
        await createMissionAction({
          client_id: clientId, market, title,
          description: description || null,
          start_date: startDate || null,
          end_date: endDate || null,
          daily_rate: dailyRate ? parseFloat(dailyRate) : null,
          estimated_days: estimatedDays ? parseFloat(estimatedDays) : null,
          currency,
          notes: notes || null,
        });
        router.push("/missions");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la création");
      }
    });
  };

  return (
    <>
      <Header
        title="Nouvelle mission"
        subtitle="Créez une mission pour un client"
        actions={
          <Link href="/missions">
            <Button variant="ghost" size="sm" iconLeft={<ArrowLeft className="w-3.5 h-3.5" />}>
              Retour
            </Button>
          </Link>
        }
      />

      <PageWrapper>
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-5">

          <motion.div {...card(0)}>
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}>
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <h2 className="font-heading text-sm font-semibold text-[var(--color-text)]">Informations générales</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Marché"
                    value={market}
                    onChange={(e) => { setMarket(e.target.value as Market); setClientId(""); }}
                    required
                  >
                    <option value="france">🇫🇷 France</option>
                    <option value="guinee">🇬🇳 Guinée</option>
                  </Select>
                  <Select label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                    <option value="">Sélectionner…</option>
                    {filteredClients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </div>
                <Input
                  label="Titre de la mission"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ingénierie CFO — Site SANOFI Vitry"
                  required
                />
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Détails de la mission, livrables attendus…"
                  rows={3}
                />
              </div>
            </Card>
          </motion.div>

          <motion.div {...card(1)}>
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center" style={{ backgroundColor: "var(--color-warning-dim)", color: "var(--color-warning)" }}>
                  <Calculator className="w-3.5 h-3.5" />
                </div>
                <h2 className="font-heading text-sm font-semibold text-[var(--color-text)]">Planification & finances</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date de début"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="Date de fin (estimée)"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Input
                  label={`Taux journalier (${currency})`}
                  type="number"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  min="0"
                  step="1"
                  placeholder="600"
                />
                <Input
                  label="Jours estimés"
                  type="number"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  min="0"
                  step="0.5"
                  placeholder="20"
                />
              </div>
              <AnimatePresence>
                {estimatedTotal !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-4 flex items-center justify-between rounded-[var(--radius-md)] px-4 py-3"
                    style={{ backgroundColor: "var(--color-success-dim)" }}
                  >
                    <span className="text-xs text-[var(--color-text-2)]">Budget estimé</span>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--color-success)" }}>
                      {fmt(estimatedTotal)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          <motion.div {...card(2)}>
            <Card padding="lg">
              <Textarea
                label="Notes internes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informations complémentaires, contacts, accès…"
                rows={3}
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
            <Button type="submit" loading={isPending} className="flex-1">
              Créer la mission
            </Button>
            <Link href="/missions">
              <Button type="button" variant="secondary">Annuler</Button>
            </Link>
          </motion.div>
        </form>
      </PageWrapper>
    </>
  );
}
