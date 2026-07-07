"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, Clock, Receipt, CheckCheck, X } from "lucide-react";
import { getNotificationsAction, type AppNotification } from "@/lib/actions/notifications";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const TYPE_CONFIG = {
  overdue: { icon: AlertTriangle, color: "var(--color-danger)", bg: "var(--color-danger-dim)", label: "En retard" },
  expiring: { icon: Clock, color: "var(--color-warning)", bg: "var(--color-warning-dim)", label: "Expire bientôt" },
  unpaid: { icon: Receipt, color: "var(--color-accent)", bg: "var(--color-accent-dim)", label: "Impayée" },
  info: { icon: Bell, color: "var(--color-text-2)", bg: "var(--color-bg-2)", label: "Info" },
};

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [isLoading, startLoad] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  const visible = notifications.filter((n) => !dismissed.has(n.id));
  const count = visible.length;

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Fetch notifications when panel opens */
  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && notifications.length === 0) {
      startLoad(async () => {
        const data = await getNotificationsAction();
        setNotifications(data);
      });
    }
  };

  const dismiss = (id: string) => setDismissed((prev) => new Set(prev).add(id));
  const dismissAll = () => setDismissed(new Set(notifications.map((n) => n.id)));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] transition-colors relative"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="w-4 h-4" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-3xs font-bold flex items-center justify-center text-white"
              style={{ backgroundColor: "var(--color-danger)" }}
            >
              {count > 9 ? "9+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease } }}
            exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.14 } }}
            className="absolute right-0 top-full mt-2 w-80 z-50 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-lg)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
              <h3 className="font-heading text-sm font-semibold text-[var(--color-text)]">Notifications</h3>
              {visible.length > 0 && (
                <button
                  onClick={dismissAll}
                  className="flex items-center gap-1 text-xs text-[var(--color-text-3)] hover:text-[var(--color-text-2)] transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  Tout effacer
                </button>
              )}
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-1 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-3 rounded-[var(--radius-md)] animate-pulse">
                      <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-bg-2)] shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 bg-[var(--color-bg-2)] rounded w-3/4" />
                        <div className="h-2 bg-[var(--color-bg-2)] rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-10 gap-2"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-bg-2)" }}>
                    <Bell className="w-4 h-4 text-[var(--color-text-3)]" />
                  </div>
                  <p className="text-xs text-[var(--color-text-3)]">Aucune notification</p>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
                  className="p-2 space-y-0.5"
                >
                  <AnimatePresence>
                    {visible.map((notif) => {
                      const { icon: Icon, color, bg } = TYPE_CONFIG[notif.type];
                      return (
                        <motion.div
                          key={notif.id}
                          variants={{
                            hidden: { opacity: 0, x: -8 },
                            visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease } },
                          }}
                          exit={{ opacity: 0, x: 20, transition: { duration: 0.16 } }}
                          className="group flex items-start gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-2)] transition-colors"
                        >
                          <Link href={notif.href} onClick={() => setOpen(false)} className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: bg }}>
                              <Icon className="w-3.5 h-3.5" style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[var(--color-text)] truncate">{notif.title}</p>
                              <p className="text-2xs text-[var(--color-text-3)] mt-0.5 truncate">{notif.description}</p>
                            </div>
                          </Link>
                          <button
                            onClick={() => dismiss(notif.id)}
                            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-3)] hover:text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] opacity-0 group-hover:opacity-100 transition-all"
                            aria-label="Ignorer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
