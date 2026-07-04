"use client";

import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import type { AccountingEntry } from "@/types/database";

export function ComptabiliteTable({ entries, currency }: { entries: AccountingEntry[]; currency: string }) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);

  const columns: Column<AccountingEntry>[] = [
    {
      key: "date", label: "Date", sortable: true,
      render: (v) => new Date(String(v)).toLocaleDateString("fr-FR"),
    },
    {
      key: "type", label: "Type",
      render: (v) => (
        <Badge variant={v === "income" ? "success" : "danger"}>
          {v === "income" ? "Recette" : "Dépense"}
        </Badge>
      ),
    },
    { key: "category", label: "Catégorie", sortable: true },
    { key: "label", label: "Libellé" },
    { key: "reference", label: "Référence" },
    {
      key: "amount", label: "Montant", align: "right", sortable: true,
      render: (v, row) => (
        <span
          className="font-semibold tabular-nums"
          style={{ color: row.type === "income" ? "var(--color-success)" : "var(--color-danger)" }}
        >
          {row.type === "income" ? "+" : "−"}{fmt(v as number)}
        </span>
      ),
    },
  ];

  return (
    <DataTable<AccountingEntry>
      data={entries}
      columns={columns}
      searchable
      searchPlaceholder="Rechercher une écriture…"
      searchKeys={["label", "category", "reference"]}
      emptyMessage="Aucune écriture comptable"
    />
  );
}
