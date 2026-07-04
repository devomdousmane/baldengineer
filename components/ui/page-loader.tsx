"use client";

import { AnimatePresence, motion } from "framer-motion";

interface PageLoaderProps {
  show: boolean;
}

export function PageLoader({ show }: PageLoaderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-[var(--color-bg)] bg-mesh"
          role="status"
          aria-label="Chargement"
          aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="h-14 w-14 rounded-[var(--radius-xl)] bg-gradient-primary flex items-center justify-center text-white text-lg font-bold shadow-[var(--shadow-glow)]">
                BP
              </div>
              <motion.div
                className="absolute inset-0 rounded-[var(--radius-xl)] bg-gradient-primary opacity-40"
                animate={{ scale: [1, 1.35, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-heading font-semibold text-base text-[var(--color-text)] tracking-tight">
                BaldPro
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
