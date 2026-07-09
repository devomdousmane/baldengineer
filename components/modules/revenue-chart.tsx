"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { RevenuePoint } from "@/lib/actions/dashboard";

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

interface Props {
  data: RevenuePoint[];
  year: number;
  currency: string;
  market?: "france" | "guinee" | "all";
}

interface ChartPoint {
  month: string;
  france: number;
  guinee: number;
}

export function RevenueChart({ data, year, currency, market = "all" }: Props) {
  const showFrance = market === "france" || market === "all";
  const showGuinee = market === "guinee" || market === "all";

  /* Normalize to 12 months */
  const chartData: ChartPoint[] = Array.from({ length: 12 }, (_, i) => {
    const monthStr = `${year}-${String(i + 1).padStart(2, "0")}`;
    const fr = data.find((d) => d.month === monthStr && d.market === "france")?.revenue ?? 0;
    const gn = data.find((d) => d.month === monthStr && d.market === "guinee")?.revenue ?? 0;
    return { month: MONTHS_FR[i], france: fr, guinee: gn };
  });

  const fmt = (v: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Chiffre d&apos;affaires {year}</h2>
          <p className="text-xs text-[var(--color-text-3)] mt-0.5">Encaissements par mois</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradFR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradGN" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-viz-amber)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--color-viz-amber)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "12px",
              color: "var(--color-text)",
              boxShadow: "var(--shadow-md)",
            }}
            formatter={(value, name) => [fmt(Number(value ?? 0)), String(name) === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"]}
            labelFormatter={(label) => `${label} ${year}`}
          />
          {showFrance && showGuinee && (
            <Legend
              formatter={(v) => v === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"}
              wrapperStyle={{ fontSize: "12px", color: "var(--color-text-2)" }}
            />
          )}
          {showFrance && (
            <Area
              type="monotone" dataKey="france" stroke="var(--color-accent)"
              fill="url(#gradFR)" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
            />
          )}
          {showGuinee && (
            <Area
              type="monotone" dataKey="guinee" stroke="var(--color-viz-amber)"
              fill="url(#gradGN)" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
