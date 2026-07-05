"use client";

import { Search, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface ListToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  filters?: FilterOption[];
  active?: string;
  onFilter?: (value: string) => void;
}

/** Barre recherche + chips de filtre, partagée par les listes du dashboard. */
export function ListToolbar({
  search,
  onSearch,
  placeholder = "Rechercher…",
  filters,
  active = "",
  onFilter,
}: ListToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search
          className="w-4 h-4 text-[var(--color-text-3)] absolute left-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          aria-label="Rechercher"
          className="w-full h-9 pl-9 pr-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-3)] transition-colors duration-[var(--dur-fast)] focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            aria-label="Effacer la recherche"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {filters && onFilter && (
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilter(f.value)}
              className={`px-3 h-9 rounded-[var(--radius-md)] text-xs font-medium border transition-colors duration-[var(--dur-fast)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                active === f.value
                  ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent)]/30"
                  : "bg-[var(--color-card)] text-[var(--color-text-2)] border-[var(--color-border)] hover:border-[var(--color-border-2)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
