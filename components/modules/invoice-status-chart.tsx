"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

export interface StatusBreakdownItem {
  status: string;
  count: number;
  amount: number;
}

interface Props {
  data: StatusBreakdownItem[];
  currency: string;
  title?: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon", sent: "Envoyée", paid: "Payée", partial: "Partielle",
  overdue: "En retard", cancelled: "Annulée", accepted: "Accepté", refused: "Refusé", expired: "Expiré",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "var(--color-text-3)", sent: "var(--color-accent)", paid: "var(--color-success)",
  partial: "var(--color-warning)", overdue: "var(--color-danger)", cancelled: "var(--color-text-3)",
  accepted: "var(--color-success)", refused: "var(--color-danger)", expired: "var(--color-text-3)",
};

export function InvoiceStatusChart({ data, currency, title = "Répartition par statut" }: Props) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);

  const filtered = data.filter((d) => d.count > 0);
  const total = filtered.reduce((s, d) => s + d.count, 0);

  return (
    <Card padding="md">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">{title}</h2>
        <p className="text-xs text-[var(--color-text-3)] mt-0.5">{total} document{total !== 1 ? "s" : ""} au total</p>
      </div>

      {filtered.length === 0 ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-xs text-[var(--color-text-3)]">Aucune donnée</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={filtered}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="42%"
              innerRadius={44}
              outerRadius={66}
              paddingAngle={2}
              strokeWidth={0}
            >
              {filtered.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "var(--color-text-3)"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
                color: "var(--color-text)",
                boxShadow: "var(--shadow-md)",
              }}
              formatter={(value, _name, item) => [
                `${value} · ${fmt(item.payload.amount)}`,
                STATUS_LABELS[item.payload.status] ?? item.payload.status,
              ]}
            />
            <Legend
              formatter={(_v, entry) => {
                const status = (entry.payload as unknown as StatusBreakdownItem)?.status;
                return <span style={{ color: "var(--color-text-2)" }}>{STATUS_LABELS[status] ?? status}</span>;
              }}
              wrapperStyle={{ fontSize: "12px" }}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
