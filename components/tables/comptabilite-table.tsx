"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { deleteAccountingEntryAction } from "@/lib/actions/accounting";
import { Trash2 } from "lucide-react";
import type { AccountingEntry } from "@/types/database";

export function ComptabiliteTable({ entries, currency }: { entries: AccountingEntry[]; currency: string }) {
  const router = useRouter();
  const toast = useToast();
  const [toDelete, setToDelete] = useState<AccountingEntry | null>(null);
  const [isPending, startTransition] = useTransition();

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);

  const confirmDelete = () => {
    if (!toDelete) return;
    startTransition(async () => {
      try {
        await deleteAccountingEntryAction(toDelete.id);
        toast.success("Écriture supprimée", { description: toDelete.label });
        setToDelete(null);
        router.refresh();
      } catch (err) {
        toast.error("Échec de la suppression", { description: err instanceof Error ? err.message : undefined });
      }
    });
  };

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
    <>
      <DataTable<AccountingEntry>
        data={entries}
        columns={columns}
        searchable
        searchPlaceholder="Rechercher une écriture…"
        searchKeys={["label", "category", "reference"]}
        emptyMessage="Aucune écriture comptable"
        actions={(row) => (
          <button
            onClick={(e) => { e.stopPropagation(); setToDelete(row); }}
            aria-label="Supprimer l'écriture"
            className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-dim)] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      />

      <ConfirmModal
        open={!!toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer cette écriture ?"
        description={toDelete ? `« ${toDelete.label} » (${fmt(toDelete.amount)}) sera définitivement supprimée.` : undefined}
        confirmLabel="Supprimer"
        variant="danger"
        loading={isPending}
      />
    </>
  );
}
