"use client";

import { motion } from "framer-motion";
import { LayoutGrid, List, Table2, Columns3 } from "lucide-react";

export type ViewMode = "table" | "grid" | "list" | "kanban";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  modes?: ViewMode[];
}

const ALL_VIEWS: { id: ViewMode; icon: React.ElementType; label: string }[] = [
  { id: "table",  icon: Table2,    label: "Tableau" },
  { id: "grid",   icon: LayoutGrid, label: "Grille"  },
  { id: "list",   icon: List,      label: "Liste"   },
  { id: "kanban", icon: Columns3,  label: "Kanban"  },
];

export function ViewToggle({ value, onChange, modes }: ViewToggleProps) {
  const views = modes ? ALL_VIEWS.filter((v) => modes.includes(v.id)) : ALL_VIEWS.slice(0, 3);

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-2)]">
      {views.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          aria-label={label}
          aria-pressed={value === id}
          title={label}
          className="relative w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          style={{ color: value === id ? "var(--color-accent)" : "var(--color-text-3)" }}
        >
          {value === id && (
            <motion.div
              layoutId="view-pill"
              className="absolute inset-0 rounded-[var(--radius-sm)]"
              style={{ backgroundColor: "var(--color-accent-dim)" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            />
          )}
          <Icon className="w-3.5 h-3.5 relative z-10" />
        </button>
      ))}
    </div>
  );
}
