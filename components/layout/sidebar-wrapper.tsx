"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bot } from "lucide-react";
import { Sidebar } from "./sidebar";
import { AiPanel } from "@/components/ai/ai-panel";
import { SpotlightTour, hasSeenTour } from "./spotlight-tour";
import { signOut } from "@/lib/actions/auth";
import type { Market } from "@/types/database";

interface Props {
  userName: string;
  userAvatar: string | null;
  market: Market;
}

export function SidebarWrapper({ userName, userAvatar, market }: Props) {
  const [aiOpen, setAiOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const pathname = usePathname();

  /* Déclenchement automatique à la première connexion, une fois arrivé sur le tableau de bord. */
  useEffect(() => {
    if (pathname === "/" && !hasSeenTour()) {
      const t = setTimeout(() => setTourOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  return (
    <>
      <Sidebar
        userName={userName}
        userAvatar={userAvatar}
        market={market}
        onSignOut={async () => { await signOut(); }}
        onAiOpen={() => setAiOpen(true)}
        onTourStart={() => setTourOpen(true)}
      />
      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} market={market} />
      <SpotlightTour open={tourOpen} onClose={() => setTourOpen(false)} />

      <AnimatePresence>
        {!aiOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={() => setAiOpen(true)}
            aria-label="Ouvrir l'assistant IA"
            className="fixed bottom-5 right-5 z-[var(--z-modal)] w-12 h-12 rounded-full flex items-center justify-center shadow-[var(--shadow-lg)] cursor-pointer"
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          >
            <Bot className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
