"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2, type LucideIcon } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface ConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  icon?: LucideIcon;
  loading?: boolean;
}

const variantStyles = {
  danger: {
    iconWrap: "bg-[var(--color-danger-dim)] text-[var(--color-danger)]",
    btn: "bg-[var(--color-danger)] text-white hover:brightness-110",
    defaultIcon: Trash2,
  },
  warning: {
    iconWrap: "bg-[var(--color-warning-dim)] text-[var(--color-warning)]",
    btn: "bg-[var(--color-warning)] text-white hover:brightness-110",
    defaultIcon: AlertTriangle,
  },
  default: {
    iconWrap: "bg-[var(--color-accent-dim)] text-[var(--color-accent)]",
    btn: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hi)]",
    defaultIcon: AlertTriangle,
  },
};

export function ConfirmModal({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  icon,
  loading = false,
}: ConfirmModalProps) {
  const styles = variantStyles[variant];
  const Icon = icon ?? styles.defaultIcon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            className="w-full max-w-sm rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-xl)]"
          >
            <div className="flex items-start gap-3 mb-5">
              <div className={`w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 mt-0.5 ${styles.iconWrap}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-text)]">{title}</h2>
                {description && (
                  <p className="text-xs text-[var(--color-text-2)] mt-1 leading-relaxed">{description}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] text-sm text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] transition-colors duration-[var(--dur-fast)] cursor-pointer disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 h-9 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-[var(--dur-fast)] cursor-pointer disabled:opacity-50 ${styles.btn}`}
              >
                {loading ? "…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
