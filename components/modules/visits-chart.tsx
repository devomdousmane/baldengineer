"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { Card } from "@/components/ui/card";

export interface VisitsPoint {
  date: string;   // "YYYY-MM-DD"
  count: number;
}

export interface CountryBreakdownItem {
  country: string; // code pays ou "—" si inconnu
  count: number;
}

interface VisitsChartProps {
  data: VisitsPoint[];
}

/** Visites dans le temps — même contrat visuel que RevenueChart/CashflowChart. */
export function VisitsChart({ data }: VisitsChartProps) {
  const fmtDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  };

  return (
    <Card padding="md">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Visites</h2>
        <p className="text-xs text-[var(--color-text-3)] mt-0.5">Pages vues par jour</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradVisits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fontSize: 11, fill: "var(--color-text-3)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-text-3)" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
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
            formatter={(value) => [`${value}`, "Visites"]}
            labelFormatter={(label) => fmtDate(String(label))}
          />
          <Area
            type="monotone" dataKey="count" stroke="var(--color-accent)"
            fill="url(#gradVisits)" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

const COUNTRY_LABELS: Record<string, string> = {
  FR: "🇫🇷 France",
  GN: "🇬🇳 Guinée",
  US: "🇺🇸 États-Unis",
  GB: "🇬🇧 Royaume-Uni",
  SN: "🇸🇳 Sénégal",
  CI: "🇨🇮 Côte d'Ivoire",
  ML: "🇲🇱 Mali",
  BE: "🇧🇪 Belgique",
  CA: "🇨🇦 Canada",
  MA: "🇲🇦 Maroc",
};

function countryLabel(code: string): string {
  return COUNTRY_LABELS[code] ?? code;
}

/** Classement des visites par pays — pas de lib de carte, un bar chart horizontal suffit. */
export function CountryBreakdownChart({ data }: { data: CountryBreakdownItem[] }) {
  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 8);

  return (
    <Card padding="md">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Visites par pays</h2>
        <p className="text-xs text-[var(--color-text-3)] mt-0.5">Top 8 — géolocalisation par IP</p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-[var(--color-text-3)] py-8 text-center">Aucune donnée pour le moment</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, sorted.length * 32)}>
          <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="country"
              tickFormatter={countryLabel}
              tick={{ fontSize: 12, fill: "var(--color-text-2)" }}
              axisLine={false}
              tickLine={false}
              width={110}
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
              formatter={(value) => [`${value}`, "Visites"]}
              labelFormatter={(label) => countryLabel(String(label))}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
              {sorted.map((_, i) => (
                <Cell key={i} fill="var(--color-accent)" fillOpacity={1 - i * 0.08} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
