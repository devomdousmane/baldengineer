"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number;
}

interface ToastOptions {
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  show: (variant: ToastVariant, title: string, options?: ToastOptions) => void;
  success: (title: string, options?: ToastOptions) => void;
  error: (title: string, options?: ToastOptions) => void;
  warning: (title: string, options?: ToastOptions) => void;
  info: (title: string, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_CONFIG: Record<ToastVariant, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: "var(--color-success)", bg: "var(--color-success-dim)" },
  error:   { icon: XCircle,      color: "var(--color-danger)",  bg: "var(--color-danger-dim)" },
  warning: { icon: AlertTriangle,color: "var(--color-warning)", bg: "var(--color-warning-dim)" },
  info:    { icon: Info,         color: "var(--color-info)",    bg: "var(--color-info-dim)" },
};

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((variant: ToastVariant, title: string, options?: ToastOptions) => {
    const id = `toast-${++counter.current}`;
    const duration = options?.duration ?? DEFAULT_DURATION;
    setToasts((prev) => [...prev, { id, variant, title, description: options?.description, duration }]);
  }, []);

  const api = useMemo<ToastContextValue>(() => ({
    show,
    success: (title, options) => show("success", title, options),
    error:   (title, options) => show("error", title, options),
    warning: (title, options) => show("warning", title, options),
    info:    (title, options) => show("info", title, options),
    dismiss,
  }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-96 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const { icon: Icon, color, bg } = VARIANT_CONFIG[toast.variant];

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timeout = setTimeout(onDismiss, toast.duration);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, toast.duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className="pointer-events-auto flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-lg)] p-3.5"
      role="status"
    >
      <div
        className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-medium text-[var(--color-text)] leading-snug">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-[var(--color-text-2)] mt-0.5 leading-snug">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Fermer la notification"
        className="w-6 h-6 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--color-text-3)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)] transition-colors duration-[var(--dur-fast)] cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé à l'intérieur de <ToastProvider>");
  return ctx;
}
