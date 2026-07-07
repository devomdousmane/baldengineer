"use client";

import { useState, useMemo, useEffect, type ReactNode } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight, ChevronLeft, Search } from "lucide-react";

const PAGE_SIZE = 25;

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
}

type SortDir = "asc" | "desc" | null;

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 skeleton" style={{ width: `${60 + ((i * 17) % 31)}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T extends { id: string }>({
  data, columns, searchable, searchPlaceholder = "Rechercher…", searchKeys = [],
  emptyMessage = "Aucun résultat", loading, onRowClick, actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  const handleSort = (key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else { setSortKey(null); setSortDir(null); }
  };

  const filtered = useMemo(() => {
    if (!search.trim() || searchKeys.length === 0) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
    );
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey] ?? "";
      const bVal = (b as Record<string, unknown>)[sortKey] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), "fr");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  /* Revenir en page 1 si les données/le filtre changent et rendent la page courante hors bornes. */
  useEffect(() => {
    setPage(1);
  }, [data, search, sortKey, sortDir]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  const allCols = actions
    ? [...columns, { key: "_actions", label: "", sortable: false, align: "right" as const }]
    : columns;

  return (
    <div className="flex flex-col gap-3">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-3)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0"
            aria-label={searchPlaceholder}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-xs)] animate-fade-in">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)]" style={{ backgroundColor: "var(--table-header-bg)" }}>
              {allCols.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-2.5 text-left text-xs font-semibold text-[var(--color-text-2)] whitespace-nowrap select-none ${col.sortable ? "cursor-pointer hover:text-[var(--color-text)]" : ""} ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}`}
                  style={{ width: col.width }}
                  onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                  aria-sort={
                    sortKey === String(col.key)
                      ? sortDir === "asc" ? "ascending" : "descending"
                      : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortKey === String(col.key)
                        ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
                        : <ChevronsUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={allCols.length} />
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={allCols.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-bg-2)]">
                      <Search className="w-4 h-4 text-[var(--color-text-3)]" />
                    </div>
                    <p className="text-sm text-[var(--color-text-3)]">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr
                  key={row.id}
                  className={`group border-b border-[var(--color-border)] last:border-0 transition-colors duration-[var(--dur-fast)] hover:bg-[var(--color-bg-2)] ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={{ height: "var(--table-row-height)" }}
                >
                  {columns.map((col, i) => {
                    const raw = (row as Record<string, unknown>)[String(col.key)];
                    return (
                      <td
                        key={String(col.key)}
                        className={`px-4 py-2 text-[var(--color-text)] whitespace-nowrap ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}`}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {col.render ? col.render(raw, row) : (raw != null ? String(raw) : "—")}
                          {onRowClick && i === columns.length - 1 && !actions && (
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0 transition-all duration-[var(--dur-fast)] text-[var(--color-text-3)]" />
                          )}
                        </span>
                      </td>
                    );
                  })}
                  {actions && (
                    <td className="px-4 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && sorted.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-text-3)]">
            {sorted.length} résultat{sorted.length > 1 ? "s" : ""}
            {pageCount > 1 && ` · page ${page}/${pageCount}`}
          </p>
          {pageCount > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Page précédente"
                className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
                aria-label="Page suivante"
                className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
