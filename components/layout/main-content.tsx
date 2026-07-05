"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSidebar } from "./sidebar-context";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Zone de contenu principal — sa marge gauche (desktop uniquement) suit l'état collapsed de la sidebar. */
export function MainContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <motion.main
      className="flex-1 flex flex-col min-h-full overflow-y-auto min-w-0"
      animate={{ marginLeft: isDesktop ? (collapsed ? 72 : 240) : 0 }}
      transition={{ duration: 0.22, ease }}
    >
      {children}
    </motion.main>
  );
}
