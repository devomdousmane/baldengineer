"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
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

export function EmailDialog({ open, onClose, config, onSent }: EmailDialogProps) {
  const [to, setTo] = useState(config.defaultTo ?? "");
  const [cc, setCc] = useState(config.defaultCc ?? "");
  const [subject, setSubject] = useState(config.defaultSubject);
  const [message, setMessage] = useState(config.defaultMessage ?? "");
  const [showCc, setShowCc] = useState(false);
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
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-dim)] flex items-center justify-center">
                    <Send className="w-4 h-4 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm text-[var(--color-text)]">Envoyer par email</h2>
                    <p className="text-[11px] text-[var(--color-muted)]">{config.defaultSubject}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-hover)] transition-colors text-[var(--color-muted)]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                {/* To */}
                <Input
                  label="À (destinataire)"
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="client@exemple.com"
                  required
                />

                {/* CC toggle */}
                <button
                  type="button"
                  onClick={() => setShowCc((v) => !v)}
                  className="flex items-center gap-1 text-xs text-[var(--color-accent)] font-medium hover:underline"
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

                {/* Subject */}
                <Input
                  label="Objet"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />

                {/* Custom message */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
                    Message personnalisé <span className="normal-case font-normal">(optionnel)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Ajoutez un message personnalisé qui remplacera le texte par défaut…"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] resize-none placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors"
                  />
                </div>

                {/* Progress fields (for mission_avancement) */}
                {config.showProgress && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
                        Avancement ({progressPct}%)
                      </label>
                      <input
                        type="range" min="0" max="100" step="5"
                        value={progressPct}
                        onChange={(e) => setProgressPct(e.target.value)}
                        className="w-full accent-[var(--color-accent)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
                        Note de progression
                      </label>
                      <textarea
                        value={progressNote}
                        onChange={(e) => setProgressNote(e.target.value)}
                        rows={2}
                        placeholder="Décrivez les avancées, jalons atteints, points à venir…"
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] resize-none placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <p className="text-xs text-[var(--color-danger)] bg-[var(--color-danger-dim)] px-3 py-2 rounded-lg">{error}</p>
                )}

                {/* Success */}
                {sent && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-[var(--color-success)] bg-[var(--color-success-dim)] px-3 py-2 rounded-lg font-medium"
                  >
                    Email envoyé avec succès !
                  </motion.p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                <p className="text-[11px] text-[var(--color-muted)]">
                  Envoyé via <span className="font-semibold text-[var(--color-accent)]">BaldPro</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={onClose} disabled={isPending}>
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={send}
                    loading={isPending}
                    disabled={isPending || sent}
                    iconLeft={isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  >
                    {sent ? "Envoyé !" : "Envoyer"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
