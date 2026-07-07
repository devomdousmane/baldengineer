"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Period, MarketFilter } from "@/lib/actions/dashboard";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "month", label: "Ce mois" },
  { value: "quarter", label: "Ce trimestre" },
  { value: "year", label: "Cette année" },
];

const MARKET_OPTIONS: { value: MarketFilter; label: string }[] = [
  { value: "france", label: "🇫🇷 France" },
  { value: "guinee", label: "🇬🇳 Guinée" },
  { value: "all", label: "Tous" },
];

function FilterPills<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-[var(--radius-md)] bg-[var(--color-bg-2)] border border-[var(--color-border)] w-fit">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 h-7 rounded-[calc(var(--radius-md)-2px)] text-xs font-medium transition-all duration-[var(--dur-fast)] cursor-pointer ${
            value === o.value
              ? "bg-[var(--color-card)] text-[var(--color-text)] shadow-[var(--shadow-xs)]"
              : "text-[var(--color-text-2)] hover:text-[var(--color-text)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DashboardFilters({ period, market }: { period: Period; market: MarketFilter }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: "period" | "market", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  return (
    <div data-tour="dashboard-filters" className="flex flex-wrap items-center gap-3">
      <FilterPills options={PERIOD_OPTIONS} value={period} onChange={(v) => setParam("period", v)} />
      <FilterPills options={MARKET_OPTIONS} value={market} onChange={(v) => setParam("market", v)} />
    </div>
  );
}
