"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface AsideTip {
  icon?: ReactNode;
  title: string;
  body: string;
}

interface PageAsideProps {
  title?: string;
  description?: string;
  tips: AsideTip[];
}

export function PageAside({ title = "Comment ça marche ?", description, tips }: PageAsideProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="xl:hidden fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center shadow-[var(--shadow-lg)] transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: "var(--color-accent)", color: "white" }}
        aria-label="Aide"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="xl:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="xl:hidden fixed right-0 top-0 bottom-0 z-50 w-80 flex flex-col bg-[var(--color-card)] border-l border-[var(--color-border)] shadow-[var(--shadow-xl)]"
          >
            <AsideContent title={title} description={description} tips={tips} onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop always-visible aside */}
      <motion.aside
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="hidden xl:flex flex-col w-72 shrink-0 self-start sticky top-[calc(var(--header-height)+1.5rem)]"
      >
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-sm)] overflow-hidden">
          <AsideContent title={title} description={description} tips={tips} />
        </div>
      </motion.aside>
    </>
  );
}

function AsideContent({
  title, description, tips, onClose,
}: { title: string; description?: string; tips: AsideTip[]; onClose?: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <p className="text-sm font-semibold text-[var(--color-text)] font-heading">{title}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {description && (
          <p className="text-xs text-[var(--color-text-2)] leading-relaxed">{description}</p>
        )}
        {tips.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 space-y-1 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 shrink-0 text-[var(--color-accent)]" />
              <p className="text-xs font-semibold text-[var(--color-text)] font-heading">{tip.title}</p>
            </div>
            <p className="text-xs text-[var(--color-text-2)] leading-relaxed pl-5">{tip.body}</p>
          </motion.div>
        ))}
      </div>
    </>
  );
}
