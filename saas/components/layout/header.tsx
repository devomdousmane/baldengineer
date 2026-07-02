"use client";

import { Plus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationsPanel } from "./notifications-panel";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  onAiOpen?: () => void;
}

export function Header({ title, subtitle, actions, onAiOpen }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease }}
      className="sticky top-0 z-[var(--z-header)] border-b border-[var(--color-border)] bg-[var(--color-card)]/90 backdrop-blur-sm px-5 flex items-center gap-4"
      style={{ height: "var(--header-height)" }}
    >
      {/* Title area */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease } }}
            exit={{ opacity: 0, y: -5, transition: { duration: 0.14 } }}
          >
            <h1 className="font-heading font-semibold text-base text-[var(--color-text)] truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[var(--color-text-3)] leading-none mt-0.5 truncate">{subtitle}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.08, ease }}
        className="flex items-center gap-1.5 shrink-0"
      >
        {actions}
        <ThemeToggle />
        {onAiOpen && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAiOpen}
            className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center transition-colors relative"
            style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}
            aria-label="Ouvrir l'assistant IA"
            title="Assistant IA"
          >
            <Sparkles className="w-4 h-4" />
          </motion.button>
        )}
        <NotificationsPanel />
      </motion.div>
    </motion.header>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="primary"
      size="sm"
      iconLeft={<Plus className="w-3.5 h-3.5" />}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
