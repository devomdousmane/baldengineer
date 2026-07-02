"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { Badge } from "@/components/ui/badge";
import { updateMissionStatusAction } from "@/lib/actions/missions";
import { Briefcase, Calendar, TrendingUp, ArrowRight, CheckCircle2, Clock, XCircle, PlayCircle, Edit2 } from "lucide-react";
import type { Mission, MissionStatus } from "@/types/database";

const statusConfig: Record<MissionStatus, {
  label: string;
  variant: "default" | "info" | "success" | "danger" | "warning" | "outline";
  color: string;
  bg: string;
  icon: React.ElementType;
}> = {
  pending:   { label: "À démarrer", variant: "default", color: "#64748B", bg: "#F1F5F9", icon: Clock        },
  active:    { label: "En cours",   variant: "info",    color: "#2D8A3E", bg: "#F0FFF4", icon: PlayCircle   },
  completed: { label: "Terminée",   variant: "success", color: "#059669", bg: "#ECFDF5", icon: CheckCircle2 },
  cancelled: { label: "Annulée",    variant: "outline", color: "#94A3B8", bg: "#F8FAFC", icon: XCircle      },
};

const KANBAN_COLS: MissionStatus[] = ["pending", "active", "completed", "cancelled"];

/* ── Columns ── */
function makeColumns(fmt: (n: number) => string, onEdit: (id: string) => void): Column<Mission>[] {
  return [
    {
      key: "title", label: "Mission", sortable: true,
      render: (v, row) => (
        <button
          onClick={() => onEdit(row.id)}
          className="flex items-center gap-2 group hover:text-[var(--color-accent)] transition-colors text-left"
        >
          <span className="font-medium">{String(v)}</span>
          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
        </button>
      ),
    },
    {
      key: "client", label: "Client",
      render: (_, row) => <span>{(row.client as { name?: string })?.name ?? "—"}</span>,
    },
    {
      key: "start_date", label: "Début", sortable: true,
      render: (v) => v ? new Date(String(v)).toLocaleDateString("fr-FR") : "—",
    },
    {
      key: "end_date", label: "Fin", sortable: true,
      render: (v) => v ? new Date(String(v)).toLocaleDateString("fr-FR") : "—",
    },
    {
      key: "daily_rate", label: "TJM", align: "right",
      render: (v) => v ? <span className="tabular-nums">{fmt(v as number)}</span> : "—",
    },
    {
      key: "estimated_days", label: "Jours", align: "right",
      render: (v) => v != null ? <span className="tabular-nums">{String(v)}</span> : "—",
    },
    {
      key: "status", label: "Statut",
      render: (v) => {
        const cfg = statusConfig[v as MissionStatus];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
  ];
}

/* ── Card shared by grid + kanban ── */
function MissionCard({
  mission, fmt, compact = false, onEdit,
}: { mission: Mission; fmt: (n: number) => string; compact?: boolean; onEdit: (id: string) => void }) {
  const cfg = statusConfig[mission.status];
  const total = mission.daily_rate && mission.estimated_days
    ? mission.daily_rate * mission.estimated_days : null;

  return (
    <div
      onClick={() => onEdit(mission.id)}
      className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border-2)] transition-all cursor-pointer group"
    >
      <div className={`flex items-start justify-between ${compact ? "mb-2" : "mb-3"}`}>
        <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>
          <Briefcase className="w-4 h-4" />
        </div>
        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity mt-1"
          style={{ color: cfg.color }} />
      </div>
      <p className={`font-semibold text-[var(--color-text)] mb-1 truncate ${compact ? "text-xs" : "text-sm"}`}>
        {mission.title}
      </p>
      <p className={`text-[var(--color-text-2)] mb-3 truncate ${compact ? "text-[10px]" : "text-xs"}`}>
        {(mission.client as { name?: string })?.name ?? "—"}
      </p>
      <div className="space-y-1.5 border-t border-[var(--color-border)] pt-3">
        {mission.start_date && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-3)]">
            <Calendar className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {new Date(mission.start_date).toLocaleDateString("fr-FR")}
              {mission.end_date ? ` → ${new Date(mission.end_date).toLocaleDateString("fr-FR")}` : ""}
            </span>
          </div>
        )}
        {total && (
          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--color-success)" }}>
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span>{fmt(total)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Grid ── */
function MissionGrid({ missions, fmt, onEdit }: { missions: Mission[]; fmt: (n: number) => string; onEdit: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {missions.map((m, i) => (
        <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}>
          <MissionCard mission={m} fmt={fmt} onEdit={onEdit} />
        </motion.div>
      ))}
    </div>
  );
}

/* ── List ── */
function MissionList({ missions, fmt, onEdit }: { missions: Mission[]; fmt: (n: number) => string; onEdit: (id: string) => void }) {
  return (
    <div className="space-y-1.5">
      {missions.map((m, i) => {
        const cfg = statusConfig[m.status];
        const total = m.daily_rate && m.estimated_days ? m.daily_rate * m.estimated_days : null;
        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            onClick={() => onEdit(m.id)}
            className="flex items-center gap-3 px-4 py-3 bg-[var(--color-card)] rounded-[var(--radius-md)] border border-[var(--color-border)] hover:shadow-[var(--shadow-sm)] hover:border-[var(--color-border-2)] transition-all cursor-pointer group"
          >
            <div className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">{m.title}</p>
              <p className="text-xs text-[var(--color-text-3)] truncate">{(m.client as { name?: string })?.name ?? "—"}</p>
            </div>
            {total && <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: "var(--color-success)" }}>{fmt(total)}</span>}
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 shrink-0 transition-opacity" style={{ color: cfg.color }} />
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Kanban ── */
function KanbanBoard({ missions, fmt, onEdit }: { missions: Mission[]; fmt: (n: number) => string; onEdit: (id: string) => void }) {
  const [movingId, setMovingId] = useState<string | null>(null);
  const [, startMove] = useTransition();

  const byStatus = KANBAN_COLS.reduce<Record<MissionStatus, Mission[]>>((acc, s) => {
    acc[s] = missions.filter((m) => m.status === s);
    return acc;
  }, {} as Record<MissionStatus, Mission[]>);

  const handleDrop = (missionId: string, newStatus: MissionStatus) => {
    setMovingId(missionId);
    startMove(async () => {
      await updateMissionStatusAction(missionId, newStatus).catch(() => {});
      setMovingId(null);
    });
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-start">
      {KANBAN_COLS.map((colStatus) => {
        const cfg = statusConfig[colStatus];
        const colMissions = byStatus[colStatus];
        const Icon = cfg.icon;

        return (
          <div
            key={colStatus}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("missionId");
              if (id && id !== "") handleDrop(id, colStatus);
            }}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden"
            style={{ background: "var(--color-bg)" }}
          >
            {/* Column header */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--color-border)]"
              style={{ borderLeftWidth: 3, borderLeftColor: cfg.color, background: cfg.bg }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.color }} />
              <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
              <span
                className="ml-auto text-xs font-bold tabular-nums w-5 h-5 flex items-center justify-center rounded-full"
                style={{ background: `${cfg.color}22`, color: cfg.color }}
              >
                {colMissions.length}
              </span>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[140px]">
              <AnimatePresence>
                {colMissions.length === 0 ? (
                  <motion.div
                    key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-16 text-xs text-[var(--color-text-3)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)]"
                  >
                    Déposez ici
                  </motion.div>
                ) : (
                  colMissions.map((m, i) => (
                    <motion.div
                      key={m.id}
                      layoutId={`kcard-${m.id}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: movingId === m.id ? 0.4 : 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      draggable
                      onDragStart={(e) => {
                        (e as unknown as React.DragEvent).dataTransfer.setData("missionId", m.id);
                      }}
                    >
                      <MissionCard mission={m} fmt={fmt} compact onEdit={onEdit} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main component ── */
export function MissionsTable({ missions, currency }: { missions: Mission[]; currency: string }) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("kanban");

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  const onEdit = (id: string) => router.push(`/missions/${id}`);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--color-text-3)]">
          {missions.length} mission{missions.length !== 1 ? "s" : ""}
        </p>
        <ViewToggle value={view} onChange={setView} modes={["table", "grid", "list", "kanban"]} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {view === "table"  && (
            <DataTable<Mission>
              data={missions}
              columns={makeColumns(fmt, onEdit)}
              searchable
              searchPlaceholder="Rechercher une mission…"
              searchKeys={["title"]}
              emptyMessage="Aucune mission"
            />
          )}
          {view === "grid"   && <MissionGrid   missions={missions} fmt={fmt} onEdit={onEdit} />}
          {view === "list"   && <MissionList   missions={missions} fmt={fmt} onEdit={onEdit} />}
          {view === "kanban" && <KanbanBoard   missions={missions} fmt={fmt} onEdit={onEdit} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
