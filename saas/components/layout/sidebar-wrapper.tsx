"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { AiPanel } from "@/components/ai/ai-panel";
import { signOut } from "@/lib/actions/auth";
import type { Market } from "@/types/database";

interface Props {
  userName: string;
  userAvatar: string | null;
  market: Market;
}

export function SidebarWrapper({ userName, userAvatar, market }: Props) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <Sidebar
        userName={userName}
        userAvatar={userAvatar}
        market={market}
        onSignOut={async () => { await signOut(); }}
        onAiOpen={() => setAiOpen(true)}
      />
      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} market={market} />
    </>
  );
}
