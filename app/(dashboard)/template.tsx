"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

/**
 * template.tsx (contrairement à layout.tsx) remonte à chaque navigation —
 * c'est le point d'accroche pour animer l'entrée de chaque page du dashboard.
 */
export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease }}
      className="flex-1 flex flex-col min-h-full"
    >
      {children}
    </motion.div>
  );
}
