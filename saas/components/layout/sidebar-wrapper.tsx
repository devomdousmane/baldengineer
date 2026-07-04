"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
    </>
  );
}
