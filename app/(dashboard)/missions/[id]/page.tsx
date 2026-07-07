"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { getMission, updateMissionAction, updateMissionStatusAction, deleteMissionAction } from "@/lib/actions/missions";
import { getClients } from "@/lib/actions/clients";
import { ArrowLeft, Briefcase, Calculator, Trash2, CheckCircle2, Clock, XCircle, PlayCircle } from "lucide-react";
import Link from "next/link";
import type { Client, Mission, MissionStatus } from "@/types/database";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const card = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, delay: i * 0.07, ease } },
});

const STATUS_FLOW: { status: MissionStatus; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { status: "pending",   label: "À démarrer", icon: Clock,         color: "var(--color-text-2)",  bg: "var(--color-bg-2)"        },
  { status: "active",    label: "En cours",   icon: PlayCircle,    color: "var(--color-accent)",  bg: "var(--color-accent-dim)"  },
  { status: "completed", label: "Terminée",   icon: CheckCircle2,  color: "var(--color-success)", bg: "var(--color-success-dim)" },
  { status: "cancelled", label: "Annulée",    icon: XCircle,       color: "var(--color-danger)",  bg: "var(--color-danger-dim)"  },
];

const BADGE_VARIANTS: Record<MissionStatus, "default" | "info" | "success" | "danger"> = {
  pending: "default", active: "info", completed: "success", cancelled: "danger",
};

export default function EditMissionPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState<MissionStatus>("pending");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    Promise.all([getMission(id), getClients()]).then(([m, c]) => {
      if (!m) { router.push("/missions"); return; }
      setMission(m);
      setClients(c);
      setTitle(m.title);
      setDescription(m.description ?? "");
      setClientId(m.client_id);
      setStatus(m.status);
      setStartDate(m.start_date ?? "");
      setEndDate(m.end_date ?? "");
      setDailyRate(m.daily_rate ? String(m.daily_rate) : "");
      setEstimatedDays(m.estimated_days ? String(m.estimated_days) : "");
      setNotes(m.notes ?? "");
    });
  }, [id, router]);

  if (!mission) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 rounded-full border-[var(--color-accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const filteredClients = clients.filter((c) => c.market === mission.market);
  const currency = mission.currency;
  const estimatedTotal = dailyRate && estimatedDays ? parseFloat(dailyRate) * parseFloat(estimatedDays) : null;
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateMissionAction(id, {
          title, description: description || null, client_id: clientId, status,
          start_date: startDate || null, end_date: endDate || null,
          daily_rate: dailyRate ? parseFloat(dailyRate) : null,
          estimated_days: estimatedDays ? parseFloat(estimatedDays) : null,
          notes: notes || null,
        });
        router.push("/missions");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
      }
    });
  };

  const handleStatusChange = (s: MissionStatus) => {
    setStatus(s);
    startTransition(async () => {
      await updateMissionStatusAction(id, s).catch(() => {});
    });
  };

  const handleDelete = () => {
    startDeleting(async () => {
      try {
        await deleteMissionAction(id);
        router.push("/missions");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
      }
    });
  };

  return (
    <>
      <Header
        title={title || "Mission"}
        subtitle={`${mission.market === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"} · ${(mission.client as { name?: string })?.name ?? ""}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={BADGE_VARIANTS[status]}>{STATUS_FLOW.find((s) => s.status === status)?.label}</Badge>
            <Link href="/missions">
              <Button variant="ghost" size="sm" iconLeft={<ArrowLeft className="w-3.5 h-3.5" />}>
                Retour
              </Button>
            </Link>
          </div>
        }
      />

      <PageWrapper>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-6 items-start">

          {/* ── Left: Form ── */}
          <div className="space-y-4">

            {/* Status flow */}
            <motion.div {...card(0)}>
              <Card padding="lg">
                <p className="text-xs font-semibold text-[var(--color-text-2)] uppercase tracking-widest mb-3">Statut de la mission</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STATUS_FLOW.map(({ status: s, label, icon: Icon, color, bg }) => (
                    <button
                      key={s} type="button"
                      onClick={() => handleStatusChange(s)}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-[var(--radius-md)] border transition-all text-center"
                      style={{
                        background: status === s ? bg : "var(--color-bg-2)",
                        borderColor: status === s ? color : "var(--color-border)",
                        color: status === s ? color : "var(--color-text-3)",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* General info */}
            <motion.div {...card(1)}>
              <Card padding="lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}>
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="font-heading text-sm font-semibold text-[var(--color-text)]">Informations générales</h2>
                </div>
                <div className="space-y-4">
                  <Select label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                    <option value="">Sélectionner…</option>
                    {filteredClients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                  <Input label="Titre de la mission" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Détails, livrables…" />
                </div>
              </Card>
            </motion.div>

            {/* Finance */}
            <motion.div {...card(2)}>
              <Card padding="lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center" style={{ backgroundColor: "var(--color-warning-dim)", color: "var(--color-warning)" }}>
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="font-heading text-sm font-semibold text-[var(--color-text)]">Planification & finances</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Date de début" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <Input label="Date de fin" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  <Input label={`TJM (${currency})`} type="number" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} min="0" step="1" placeholder="600" />
                  <Input label="Jours estimés" type="number" value={estimatedDays} onChange={(e) => setEstimatedDays(e.target.value)} min="0" step="0.5" placeholder="20" />
                </div>
                <AnimatePresence>
                  {estimatedTotal !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-4 flex items-center justify-between rounded-[var(--radius-md)] px-4 py-3"
                      style={{ backgroundColor: "var(--color-success-dim)" }}
                    >
                      <span className="text-xs text-[var(--color-text-2)]">Budget estimé</span>
                      <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--color-success)" }}>{fmt(estimatedTotal)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            <motion.div {...card(3)}>
              <Card padding="lg">
                <Textarea label="Notes internes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} hint="Visible uniquement pour vous" placeholder="Contacts, accès, détails…" />
              </Card>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-[var(--color-danger)] px-1">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div {...card(4)} className="flex gap-3 pb-6">
              <Button type="submit" loading={isPending} className="flex-1">Enregistrer les modifications</Button>
              <Link href="/missions"><Button type="button" variant="secondary">Annuler</Button></Link>
            </motion.div>
          </div>

          {/* ── Right: Info panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.15, ease } }}
            className="hidden xl:block space-y-4"
            style={{ position: "sticky", top: "calc(var(--header-height) + 1.5rem)" }}
          >
            {/* Mission summary */}
            <Card padding="lg">
              <p className="text-xs font-semibold text-[var(--color-text-2)] uppercase tracking-widest mb-3">Résumé</p>
              <div className="space-y-3">
                <div>
                  <p className="text-3xs uppercase tracking-widest text-[var(--color-text-3)] mb-0.5">Marché</p>
                  <p className="text-sm font-medium">{mission.market === "france" ? "🇫🇷 France · EUR" : "🇬🇳 Guinée · GNF"}</p>
                </div>
                {estimatedTotal && (
                  <div>
                    <p className="text-3xs uppercase tracking-widest text-[var(--color-text-3)] mb-0.5">Budget prévisionnel</p>
                    <p className="text-lg font-semibold tabular-nums" style={{ color: "var(--color-success)" }}>{fmt(estimatedTotal)}</p>
                    <p className="text-xs text-[var(--color-text-3)]">{estimatedDays}j × {dailyRate ? fmt(parseFloat(dailyRate)) : "—"}/j</p>
                  </div>
                )}
                {startDate && (
                  <div>
                    <p className="text-3xs uppercase tracking-widest text-[var(--color-text-3)] mb-0.5">Période</p>
                    <p className="text-sm">{new Date(startDate).toLocaleDateString("fr-FR")}{endDate ? ` → ${new Date(endDate).toLocaleDateString("fr-FR")}` : ""}</p>
                  </div>
                )}
                <div>
                  <p className="text-3xs uppercase tracking-widest text-[var(--color-text-3)] mb-0.5">Créée le</p>
                  <p className="text-sm">{new Date(mission.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            </Card>

            {/* Danger zone */}
            <Card padding="lg">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-danger)" }}>Zone dangereuse</p>
              <Button
                type="button" variant="danger" size="sm"
                iconLeft={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => setConfirmDelete(true)}
                className="w-full"
              >
                Supprimer la mission
              </Button>
              <ConfirmModal
                open={confirmDelete}
                onCancel={() => setConfirmDelete(false)}
                onConfirm={handleDelete}
                title="Supprimer la mission ?"
                description="Cette action est irréversible. La mission et son historique seront définitivement supprimés."
                confirmLabel="Supprimer"
                loading={isDeleting}
              />
            </Card>
          </motion.div>
        </form>
      </PageWrapper>
    </>
  );
}
