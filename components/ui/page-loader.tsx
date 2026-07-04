"use client";

import Image from "next/image";
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
            className="flex flex-col items-center gap-5"
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute h-20 w-20 rounded-full"
                style={{ background: "var(--color-accent)", opacity: 0.18, filter: "blur(16px)" }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.18, 0.32, 0.18] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute h-16 w-16 rounded-full border-2"
                style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
              />
              <Image
                src="/logo.png"
                alt="BaldEngineer"
                width={206}
                height={121}
                priority
                unoptimized
                className="relative h-9 w-auto object-contain"
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
