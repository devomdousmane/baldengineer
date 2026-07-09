"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export interface CashflowPoint {
  month: string; // "YYYY-MM"
  income: number;
  expense: number;
}

interface Props {
  data: CashflowPoint[];
  year: number;
  currency: string;
}

interface ChartPoint {
  month: string;
  recettes: number;
  depenses: number;
}

export function CashflowChart({ data, year, currency }: Props) {
  /* Normalize to 12 months */
  const chartData: ChartPoint[] = Array.from({ length: 12 }, (_, i) => {
    const monthStr = `${year}-${String(i + 1).padStart(2, "0")}`;
    const point = data.find((d) => d.month === monthStr);
    return {
      month: MONTHS_FR[i],
      recettes: point?.income ?? 0,
      depenses: point?.expense ?? 0,
    };
  });

  const fmt = (v: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Rapport {year}</h2>
          <p className="text-xs text-[var(--color-text-3)] mt-0.5">Recettes et dépenses par mois</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 0, left: -10, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "var(--color-text-3)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-text-3)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={{ fill: "var(--color-bg-2)" }}
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "12px",
              color: "var(--color-text)",
              boxShadow: "var(--shadow-md)",
            }}
            formatter={(value, name) => [fmt(Number(value ?? 0)), String(name) === "recettes" ? "Recettes" : "Dépenses"]}
            labelFormatter={(label) => `${label} ${year}`}
          />
          <Legend
            formatter={(v) => v === "recettes" ? "Recettes" : "Dépenses"}
            wrapperStyle={{ fontSize: "12px", color: "var(--color-text-2)" }}
          />
          <Bar dataKey="recettes" fill="var(--color-viz-positive)" radius={[4, 4, 0, 0]} maxBarSize={18} />
          <Bar dataKey="depenses" fill="var(--color-viz-negative)" radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
