"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Mail, FileText, Receipt, RefreshCw, Bell, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { EmailLogEntry, EmailLogType } from "@/lib/actions/email-logs";
import type { QuoteStatus, InvoiceStatus } from "@/types/database";

const TYPE_CONFIG: Record<EmailLogType, { label: string; icon: React.ElementType; kind: "quote" | "invoice" }> = {
  devis_envoye:        { label: "Devis envoyé",       icon: FileText,   kind: "quote"   },
  devis_relance:       { label: "Relance devis",      icon: RefreshCw,  kind: "quote"   },
  facture_envoyee:     { label: "Facture envoyée",    icon: Receipt,    kind: "invoice" },
  relance_paiement:    { label: "Relance paiement",   icon: Bell,       kind: "invoice" },
  paiement_recu:       { label: "Confirmation reçue", icon: CheckCircle2, kind: "invoice" },
  paiement_notif_admin:{ label: "Notif. paiement",    icon: CheckCircle2, kind: "invoice" },
};

const SEND_STATUS_CONFIG: Record<EmailLogEntry["status"], { label: string; color: string; icon: React.ElementType }> = {
  sent:      { label: "Envoyé",   color: "var(--color-success)", icon: CheckCircle2 },
  delivered: { label: "Délivré",  color: "var(--color-success)", icon: CheckCircle2 },
  failed:    { label: "Échec",    color: "var(--color-danger)",  icon: XCircle      },
  bounced:   { label: "Rejeté",   color: "var(--color-danger)",  icon: XCircle      },
};

const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Brouillon", sent: "Envoyé", accepted: "Accepté", refused: "Refusé", expired: "Expiré",
};
const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Brouillon", sent: "Envoyée", paid: "Payée", partial: "Partielle", overdue: "En retard", cancelled: "Annulée",
};
const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  draft: "var(--color-text-3)", sent: "var(--color-accent)", accepted: "var(--color-success)",
  refused: "var(--color-danger)", expired: "var(--color-text-3)",
};
const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "var(--color-text-3)", sent: "var(--color-accent)", paid: "var(--color-success)",
  partial: "var(--color-warning)", overdue: "var(--color-danger)", cancelled: "var(--color-text-3)",
};

const TYPE_FILTERS = [
  { value: "", label: "Tous" },
  { value: "quote", label: "Devis" },
  { value: "invoice", label: "Factures" },
];

function fmtDate(d: string) {
  return new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface Props {
  logs: EmailLogEntry[];
}

export function EmailLogsTable({ logs }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const cfg = TYPE_CONFIG[log.type];
      if (kind && cfg.kind !== kind) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${log.toEmail} ${log.subject} ${log.documentNumber ?? ""} ${log.clientName ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, search, kind]);

  const openDocument = (log: EmailLogEntry) => {
    const base = log.resourceType === "quote" ? "/devis" : "/factures";
    router.push(`${base}/${log.resourceId}`);
  };

  return (
    <div className="space-y-3">
      <ListToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Rechercher destinataire, objet, numéro…"
        filters={TYPE_FILTERS}
        active={kind}
        onFilter={setKind}
      />

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] overflow-x-auto shadow-[var(--shadow-xs)]">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]" style={{ backgroundColor: "var(--table-header-bg)" }}>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--color-text-2)]">Type</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--color-text-2)]">Document</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--color-text-2)] hidden md:table-cell">Destinataire</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--color-text-2)] hidden lg:table-cell">Envoyé le</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-[var(--color-text-2)]">Envoi</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-[var(--color-text-2)]">Statut document</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Mail className="w-8 h-8 text-[var(--color-text-3)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--color-text-3)]">Aucun email envoyé pour l&apos;instant</p>
                </td>
              </tr>
            ) : (
              filtered.map((log, i) => {
                const typeCfg = TYPE_CONFIG[log.type];
                const sendCfg = SEND_STATUS_CONFIG[log.status];
                const TypeIcon = typeCfg.icon;
                const SendIcon = sendCfg.icon;
                const docLabel = log.documentStatus
                  ? (typeCfg.kind === "quote" ? QUOTE_STATUS_LABELS[log.documentStatus as QuoteStatus] : INVOICE_STATUS_LABELS[log.documentStatus as InvoiceStatus])
                  : null;
                const docColor = log.documentStatus
                  ? (typeCfg.kind === "quote" ? QUOTE_STATUS_COLORS[log.documentStatus as QuoteStatus] : INVOICE_STATUS_COLORS[log.documentStatus as InvoiceStatus])
                  : "var(--color-text-3)";

                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                    onClick={() => openDocument(log)}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-2)] transition-colors duration-[var(--dur-fast)] cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-3.5 h-3.5 text-[var(--color-text-3)] shrink-0" />
                        <span className="text-xs font-medium text-[var(--color-text)]">{typeCfg.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-[var(--color-accent)]">{log.documentNumber ?? "—"}</p>
                      <p className="text-[11px] text-[var(--color-text-3)] truncate max-w-[160px]">{log.clientName ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-[var(--color-text-2)]">{log.toEmail}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-[var(--color-text-3)]">{fmtDate(log.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border"
                        style={{ color: sendCfg.color, borderColor: `${sendCfg.color}40`, backgroundColor: `${sendCfg.color}18` }}
                        title={log.errorMessage ?? undefined}
                      >
                        <SendIcon className="w-3 h-3 shrink-0" />
                        {sendCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {docLabel ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border"
                          style={{ color: docColor, borderColor: `${docColor}40`, backgroundColor: `${docColor}18` }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: docColor }} />
                          {docLabel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-text-3)]">
                          <Clock className="w-3 h-3" /> Supprimé
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-[var(--color-text-3)] text-right">
          {filtered.length} email{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
