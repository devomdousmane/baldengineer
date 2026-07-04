"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface EmailDialogConfig {
  type: string;
  resourceId: string;
  defaultTo?: string;
  defaultCc?: string;
  defaultSubject: string;
  defaultMessage?: string;
  /** Extra fields forwarded to the API (level, daysLate, progressPct, etc.) */
  extra?: Record<string, unknown>;
  /** If true, shows the "progress" fields (progressPct + progressNote) */
  showProgress?: boolean;
}

interface EmailDialogProps {
  open: boolean;
  onClose: () => void;
  config: EmailDialogConfig;
  onSent?: () => void;
}

const textareaClass =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] resize-none placeholder:text-[var(--color-text-3)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-border-2)] focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-accent)]";

export function EmailDialog({ open, onClose, config, onSent }: EmailDialogProps) {
  const [to, setTo] = useState(config.defaultTo ?? "");
  const [cc, setCc] = useState(config.defaultCc ?? "");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState(config.defaultSubject);
  const [message, setMessage] = useState(config.defaultMessage ?? "");
  const [progressPct, setProgressPct] = useState("50");
  const [progressNote, setProgressNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const send = () => {
    if (!to.trim()) { setError("L'adresse email est requise"); return; }
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: config.type,
            resourceId: config.resourceId,
            to: to.trim(),
            cc: cc.trim() || undefined,
            subject: subject.trim(),
            customMessage: message.trim() || undefined,
            extra: {
              ...config.extra,
              ...(config.showProgress ? {
                progressPct: parseInt(progressPct, 10),
                progressNote: progressNote.trim() || undefined,
              } : {}),
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur d'envoi");
        setSent(true);
        setTimeout(() => { onSent?.(); onClose(); setSent(false); }, 1800);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur d'envoi");
      }
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Envoyer par email"
            className="w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-xl)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[var(--radius-lg)] bg-[var(--color-accent-dim)] flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[var(--color-text)]">Envoyer par email</h2>
                  <p className="text-[11px] text-[var(--color-text-3)]">{config.defaultSubject}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)] transition-colors duration-[var(--dur-fast)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              <Input
                label="À (destinataire)"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="client@exemple.com"
                required
              />

              <button
                type="button"
                onClick={() => setShowCc((v) => !v)}
                className="flex items-center gap-1 text-xs text-[var(--color-accent)] font-medium hover:underline cursor-pointer"
              >
                {showCc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showCc ? "Masquer CC" : "Ajouter CC"}
              </button>

              <AnimatePresence>
                {showCc && (
                  <motion.div key="cc" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <Input label="CC" type="email" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="copie@exemple.com" />
                  </motion.div>
                )}
              </AnimatePresence>

              <Input
                label="Objet"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--color-text-2)]">
                  Message personnalisé <span className="font-normal text-[var(--color-text-3)]">(optionnel)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Ajoutez un message personnalisé qui remplacera le texte par défaut…"
                  className={textareaClass}
                />
              </div>

              {/* Progress fields (for mission_avancement) */}
              {config.showProgress && (
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--color-text-2)]">
                      Avancement ({progressPct}%)
                    </label>
                    <input
                      type="range" min="0" max="100" step="5"
                      value={progressPct}
                      onChange={(e) => setProgressPct(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--color-text-2)]">
                      Note de progression
                    </label>
                    <textarea
                      value={progressNote}
                      onChange={(e) => setProgressNote(e.target.value)}
                      rows={2}
                      placeholder="Décrivez les avancées, jalons atteints, points à venir…"
                      className={textareaClass}
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs text-[var(--color-danger)] bg-[var(--color-danger-dim)] px-3 py-2 rounded-[var(--radius-md)]">{error}</p>
              )}

              {sent && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-[var(--color-success)] bg-[var(--color-success-dim)] px-3 py-2 rounded-[var(--radius-md)] font-medium"
                >
                  Email envoyé avec succès !
                </motion.p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-2)]">
              <p className="hidden sm:block text-[11px] text-[var(--color-text-3)] shrink-0">
                Envoyé via <span className="font-semibold text-[var(--color-accent)]">BaldPro</span>
              </p>
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" variant="ghost" onClick={onClose} disabled={isPending}>
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={send}
                  loading={isPending}
                  disabled={isPending || sent}
                  iconLeft={isPending ? undefined : <Send className="w-3.5 h-3.5" />}
                >
                  {sent ? "Envoyé !" : "Envoyer"}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
