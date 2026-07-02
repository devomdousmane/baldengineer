"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailDialog, type EmailDialogConfig } from "@/components/modules/email-dialog";
import type { Mission } from "@/types/database";

interface MissionEmailButtonProps {
  mission: Mission & { client?: { name?: string; email?: string | null } | null };
}

type EmailType = "mission_demarree" | "mission_avancement" | "mission_terminee";

const TYPE_CONFIG: Record<EmailType, { label: string; subject: (title: string) => string; showProgress?: boolean }> = {
  mission_demarree:  { label: "Démarrage",   subject: (t) => `Démarrage de mission — ${t}` },
  mission_avancement: { label: "Avancement", subject: (t) => `Rapport d'avancement — ${t}`, showProgress: true },
  mission_terminee:  { label: "Clôture",     subject: (t) => `Mission terminée — ${t}` },
};

export function MissionEmailButton({ mission }: MissionEmailButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [activeType, setActiveType] = useState<EmailType | null>(null);

  const clientEmail = mission.client?.email ?? "";

  const open = (type: EmailType) => {
    setShowMenu(false);
    setActiveType(type);
  };

  const buildConfig = (type: EmailType): EmailDialogConfig => ({
    type,
    resourceId: mission.id,
    defaultTo: clientEmail,
    defaultSubject: TYPE_CONFIG[type].subject(mission.title),
    showProgress: TYPE_CONFIG[type].showProgress,
  });

  return (
    <>
      <div className="relative">
        <Button size="sm" variant="outline" iconLeft={<Mail className="w-3.5 h-3.5" />}
          onClick={() => setShowMenu((v) => !v)}>
          Email client
        </Button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden min-w-[200px]">
              {(Object.entries(TYPE_CONFIG) as [EmailType, typeof TYPE_CONFIG[EmailType]][]).map(([type, cfg]) => (
                <button key={type} onClick={() => open(type)}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-left text-[var(--color-text)] hover:bg-[var(--color-hover)] transition-colors">
                  <Mail className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <div>
                    <p className="font-medium">{cfg.label}</p>
                    <p className="text-[10px] text-[var(--color-muted)]">{cfg.subject(mission.title).slice(0, 40)}…</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {activeType && (
        <EmailDialog
          open
          onClose={() => setActiveType(null)}
          config={buildConfig(activeType)}
        />
      )}
    </>
  );
}
