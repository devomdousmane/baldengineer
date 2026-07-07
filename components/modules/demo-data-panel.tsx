"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { seedDemoDataAction, deleteDemoDataAction } from "@/lib/actions/seed";
import { Database, Trash2, CheckCircle, AlertTriangle } from "lucide-react";

type Status = "idle" | "success" | "error";
const CONFIRM_WORD = "SUPPRIMER";

export function DemoDataPanel() {
  const [isPendingSeed, startSeed] = useTransition();
  const [isPendingDelete, startDelete] = useTransition();
  const [seedStatus, setSeedStatus] = useState<Status>("idle");
  const [deleteStatus, setDeleteStatus] = useState<Status>("idle");
  const [seedMsg, setSeedMsg] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleSeed = () => {
    setSeedStatus("idle");
    startSeed(async () => {
      try {
        const result = await seedDemoDataAction();
        setSeedMsg(`${result.inserted} enregistrements créés (clients, devis, factures, missions, écritures).`);
        setSeedStatus("success");
      } catch (e) {
        setSeedMsg(e instanceof Error ? e.message : "Erreur");
        setSeedStatus("error");
      }
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    if (confirmText !== CONFIRM_WORD) return;
    setDeleteStatus("idle");
    setConfirmDelete(false);
    setConfirmText("");
    startDelete(async () => {
      try {
        await deleteDemoDataAction();
        setDeleteMsg("Toutes les données ont été supprimées.");
        setDeleteStatus("success");
      } catch (e) {
        setDeleteMsg(e instanceof Error ? e.message : "Erreur");
        setDeleteStatus("error");
      }
    });
  };

  return (
    <Card padding="lg">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-warning-dim)", color: "var(--color-warning)" }}
        >
          <Database className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-heading text-sm font-semibold text-[var(--color-text)]">Données de démonstration</h2>
          <p className="text-xs text-[var(--color-text-2)] mt-0.5">
            Peuplez la base avec des données réalistes pour tester l'application.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-2)] border border-[var(--color-border)] p-3 text-xs text-[var(--color-text-2)] space-y-1">
          <p className="font-medium text-[var(--color-text)]">Ce qui sera créé :</p>
          <ul className="space-y-0.5 list-disc list-inside">
            <li>3 clients France (Sanofi, Total, particulier) + 3 clients Guinée</li>
            <li>3 devis France + 2 devis Guinée (statuts variés)</li>
            <li>4 factures France + 2 factures Guinée (payées, en attente, en retard)</li>
            <li>4 missions + 6 écritures comptables</li>
          </ul>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-dim)] p-3 text-xs text-[var(--color-danger)]">
          <p className="font-medium">⚠ Cet espace de travail est partagé.</p>
          <p className="mt-0.5">
            « Supprimer toutes les données » efface irréversiblement TOUS les clients, devis, factures, missions et écritures comptables — y compris les données réelles créées par n&apos;importe quel compte, pas seulement des données de démo.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap items-start">
          <Button
            size="sm"
            variant="outline"
            iconLeft={<Database className="w-3.5 h-3.5" />}
            loading={isPendingSeed}
            onClick={handleSeed}
          >
            Charger les données de démo
          </Button>

          <AnimatePresence>
            {confirmDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-2 w-full sm:w-auto"
              >
                <p className="text-xs text-[var(--color-danger)] font-medium">
                  Tapez {CONFIRM_WORD} pour confirmer la suppression définitive de toutes les données.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={CONFIRM_WORD}
                    className="max-w-[160px]"
                  />
                  <Button size="sm" variant="danger" loading={isPendingDelete} disabled={confirmText !== CONFIRM_WORD} onClick={handleDelete}>
                    Confirmer
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setConfirmDelete(false); setConfirmText(""); }}>
                    Annuler
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Button
                key="delete"
                size="sm"
                variant="danger"
                iconLeft={<Trash2 className="w-3.5 h-3.5" />}
                loading={isPendingDelete}
                onClick={handleDelete}
              >
                Supprimer toutes les données
              </Button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {seedStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-2 text-xs p-2.5 rounded-[var(--radius-md)]"
              style={{
                backgroundColor: seedStatus === "success" ? "var(--color-success-dim)" : "var(--color-danger-dim)",
                color: seedStatus === "success" ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {seedStatus === "success" ? <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
              <span>{seedMsg}</span>
            </motion.div>
          )}
          {deleteStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-2 text-xs p-2.5 rounded-[var(--radius-md)]"
              style={{
                backgroundColor: deleteStatus === "success" ? "var(--color-success-dim)" : "var(--color-danger-dim)",
                color: deleteStatus === "success" ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {deleteStatus === "success" ? <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
              <span>{deleteMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
