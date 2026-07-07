"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Tooltip } from "@/components/ui/tooltip";
import { FolderDialog } from "@/components/modules/folder-dialog";
import { MoveItemDialog } from "@/components/modules/move-item-dialog";
import { useToast } from "@/components/ui/toast";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { getCompanyFileUrlAction, deleteCompanyFileAction, moveCompanyFileAction, copyCompanyFileAction, renameCompanyFileAction } from "@/lib/actions/files";
import { createFolderAction, renameFolderAction, deleteFolderAction, moveFolderAction } from "@/lib/actions/folders";
import {
  FileText, Image as ImageIcon, FileSpreadsheet, File as FileIcon, Download, Trash2,
  Folder, FolderPlus, ChevronRight, Home, Pencil, Copy, FolderInput, ArrowLeft,
} from "lucide-react";
import type { CompanyFile, CompanyFolder, FileCategory, Market } from "@/types/database";

const CATEGORY_LABELS: Record<string, string> = {
  facture: "Facture",
  contrat: "Contrat",
  rib: "RIB",
  justificatif: "Justificatif",
  autre: "Autre",
};

const CATEGORY_FILTERS = [
  { value: "", label: "Toutes" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

function fileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return ImageIcon;
  if (fileType.includes("sheet") || fileType.includes("excel")) return FileSpreadsheet;
  if (fileType === "application/pdf" || fileType.includes("word")) return FileText;
  return FileIcon;
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/* Ligne unifiée table : soit un dossier, soit un fichier. */
type Row =
  | { kind: "folder"; id: string; name: string; data: CompanyFolder }
  | { kind: "file"; id: string; name: string; data: CompanyFile };

interface Props {
  files: CompanyFile[];
  folders: CompanyFolder[];
  market: Market;
}

export function FilesTable({ files, folders, market }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();

  const currentFolderId = searchParams.get("folder");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [toDeleteFile, setToDeleteFile] = useState<CompanyFile | null>(null);
  const [toDeleteFolder, setToDeleteFolder] = useState<CompanyFolder | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<CompanyFolder | null>(null);
  const [renamingFile, setRenamingFile] = useState<CompanyFile | null>(null);
  const [movingFile, setMovingFile] = useState<CompanyFile | null>(null);
  const [movingFolder, setMovingFolder] = useState<CompanyFolder | null>(null);
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebouncedValue(search);

  const navigateToFolder = (folderId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (folderId) params.set("folder", folderId);
    else params.delete("folder");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  /* Fil d'Ariane : remonte les parents du dossier courant jusqu'à la racine. */
  const breadcrumb = useMemo(() => {
    const trail: CompanyFolder[] = [];
    let cursor = folders.find((f) => f.id === currentFolderId) ?? null;
    while (cursor) {
      trail.unshift(cursor);
      cursor = folders.find((f) => f.id === cursor!.parent_id) ?? null;
    }
    return trail;
  }, [folders, currentFolderId]);

  const childFolders = useMemo(
    () => folders.filter((f) => f.parent_id === currentFolderId),
    [folders, currentFolderId]
  );
  const childFiles = useMemo(
    () => files.filter((f) => f.folder_id === currentFolderId),
    [files, currentFolderId]
  );

  const filteredFolders = useMemo(() => {
    if (!debouncedSearch.trim()) return childFolders;
    const q = debouncedSearch.toLowerCase();
    return childFolders.filter((f) => f.name.toLowerCase().includes(q));
  }, [childFolders, debouncedSearch]);

  const filteredFiles = useMemo(() => {
    return childFiles.filter((f) => {
      if (category && f.category !== category) return false;
      if (debouncedSearch.trim() && !f.file_name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      return true;
    });
  }, [childFiles, debouncedSearch, category]);

  const rows: Row[] = [
    ...filteredFolders.map((f): Row => ({ kind: "folder", id: f.id, name: f.name, data: f })),
    ...filteredFiles.map((f): Row => ({ kind: "file", id: f.id, name: f.file_name, data: f })),
  ];

  const openFile = async (file: CompanyFile) => {
    const url = await getCompanyFileUrlAction(file.id);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRowClick = (row: Row) => {
    if (row.kind === "folder") navigateToFolder(row.id);
    else openFile(row.data);
  };

  const confirmDeleteFile = () => {
    if (!toDeleteFile) return;
    startTransition(async () => {
      try {
        await deleteCompanyFileAction(toDeleteFile.id);
        toast.success("Fichier supprimé", { description: toDeleteFile.file_name });
        setToDeleteFile(null);
        router.refresh();
      } catch (err) {
        toast.error("Échec de la suppression", { description: err instanceof Error ? err.message : undefined });
      }
    });
  };

  const confirmDeleteFolder = () => {
    if (!toDeleteFolder) return;
    startTransition(async () => {
      try {
        await deleteFolderAction(toDeleteFolder.id);
        toast.success("Dossier supprimé", { description: toDeleteFolder.name });
        setToDeleteFolder(null);
        router.refresh();
      } catch (err) {
        toast.error("Échec de la suppression", { description: err instanceof Error ? err.message : undefined });
      }
    });
  };

  const handleCopyFile = (file: CompanyFile) => {
    startTransition(async () => {
      try {
        await copyCompanyFileAction(file.id, currentFolderId);
        toast.success("Fichier copié", { description: file.file_name });
        router.refresh();
      } catch (err) {
        toast.error("Échec de la copie", { description: err instanceof Error ? err.message : undefined });
      }
    });
  };

  const columns: Column<Row>[] = [
    {
      key: "name", label: "Nom", sortable: true,
      render: (v, row) => {
        if (row.kind === "folder") {
          return (
            <span className="flex items-center gap-2">
              <Folder className="w-4 h-4 shrink-0 text-[var(--color-accent)]" fill="currentColor" fillOpacity={0.15} />
              <span className="font-medium truncate max-w-[240px]">{String(v)}</span>
            </span>
          );
        }
        const Icon = fileIcon(row.data.file_type);
        return (
          <span className="flex items-center gap-2">
            <Icon className="w-4 h-4 shrink-0 text-[var(--color-text-3)]" />
            <span className="truncate max-w-[240px]">{String(v)}</span>
          </span>
        );
      },
    },
    {
      key: "category", label: "Catégorie",
      render: (_v, row) =>
        row.kind === "folder"
          ? <span className="text-xs text-[var(--color-text-3)]">Dossier</span>
          : <Badge variant="default">{CATEGORY_LABELS[row.data.category as FileCategory] ?? row.data.category}</Badge>,
    },
    {
      key: "market", label: "Marché",
      render: () => (
        <Badge variant={market === "france" ? "france" : "guinee"}>{market === "france" ? "FR" : "GN"}</Badge>
      ),
    },
    {
      key: "size_bytes", label: "Taille", align: "right",
      render: (_v, row) =>
        row.kind === "file"
          ? <span className="tabular-nums text-[var(--color-text-2)]">{fmtSize(row.data.size_bytes)}</span>
          : <span className="text-[var(--color-text-3)]">—</span>,
    },
    {
      key: "created_at", label: "Ajouté le", sortable: true,
      render: (_v, row) => new Date(row.data.created_at).toLocaleDateString("fr-FR"),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Précédent + fil d'Ariane */}
      <div className="flex items-center gap-1 text-sm text-[var(--color-text-2)] flex-wrap">
        <Tooltip content="Dossier précédent">
          <button
            onClick={() => navigateToFolder(breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2].id : null)}
            disabled={!currentFolderId}
            aria-label="Dossier précédent"
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)] transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
        <button
          onClick={() => navigateToFolder(null)}
          className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" /> Fichiers
        </button>
        {breadcrumb.map((f) => (
          <span key={f.id} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-3)]" />
            <button
              onClick={() => navigateToFolder(f.id)}
              className="px-2 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
            >
              {f.name}
            </button>
          </span>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <ListToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Rechercher un fichier ou dossier…"
          filters={CATEGORY_FILTERS}
          active={category}
          onFilter={setCategory}
        />
        <button
          onClick={() => setCreatingFolder(true)}
          className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-md)] text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-2)] hover:border-[var(--color-border-2)] hover:text-[var(--color-text)] transition-colors cursor-pointer shrink-0"
        >
          <FolderPlus className="w-4 h-4" /> Nouveau dossier
        </button>
      </div>

      <DataTable<Row>
        data={rows}
        columns={columns}
        emptyMessage="Ce dossier est vide"
        onRowClick={handleRowClick}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            {row.kind === "file" ? (
              <>
                <Tooltip content="Télécharger">
                  <button
                    onClick={(e) => { e.stopPropagation(); openFile(row.data); }}
                    aria-label="Télécharger"
                    className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content="Renommer">
                  <button
                    onClick={(e) => { e.stopPropagation(); setRenamingFile(row.data); }}
                    aria-label="Renommer"
                    className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content="Dupliquer">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyFile(row.data); }}
                    aria-label="Copier"
                    className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content="Déplacer vers…">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMovingFile(row.data); }}
                    aria-label="Déplacer"
                    className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer"
                  >
                    <FolderInput className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content="Supprimer">
                  <button
                    onClick={(e) => { e.stopPropagation(); setToDeleteFile(row.data); }}
                    aria-label="Supprimer"
                    className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-dim)] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip content="Renommer">
                  <button
                    onClick={(e) => { e.stopPropagation(); setRenamingFolder(row.data); }}
                    aria-label="Renommer"
                    className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content="Déplacer vers…">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMovingFolder(row.data); }}
                    aria-label="Déplacer"
                    className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer"
                  >
                    <FolderInput className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content="Supprimer">
                  <button
                    onClick={(e) => { e.stopPropagation(); setToDeleteFolder(row.data); }}
                    aria-label="Supprimer"
                    className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-dim)] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        )}
      />

      {movingFile && (
        <MoveItemDialog
          open={!!movingFile}
          onClose={() => setMovingFile(null)}
          folders={folders}
          itemName={movingFile.file_name}
          onSubmit={async (targetFolderId) => {
            await moveCompanyFileAction(movingFile.id, targetFolderId);
            toast.success("Fichier déplacé", { description: movingFile.file_name });
            router.refresh();
          }}
        />
      )}

      {movingFolder && (
        <MoveItemDialog
          open={!!movingFolder}
          onClose={() => setMovingFolder(null)}
          folders={folders}
          excludeFolderId={movingFolder.id}
          itemName={movingFolder.name}
          onSubmit={async (targetFolderId) => {
            await moveFolderAction(movingFolder.id, targetFolderId);
            toast.success("Dossier déplacé", { description: movingFolder.name });
            router.refresh();
          }}
        />
      )}

      <FolderDialog
        open={creatingFolder}
        onClose={() => setCreatingFolder(false)}
        onSubmit={async (name) => {
          await createFolderAction(name, market, currentFolderId);
          toast.success("Dossier créé", { description: name });
          router.refresh();
        }}
        title="Nouveau dossier"
        submitLabel="Créer"
      />

      <FolderDialog
        open={!!renamingFolder}
        onClose={() => setRenamingFolder(null)}
        initialName={renamingFolder?.name ?? ""}
        onSubmit={async (name) => {
          if (!renamingFolder) return;
          await renameFolderAction(renamingFolder.id, name);
          toast.success("Dossier renommé", { description: name });
          router.refresh();
        }}
        title="Renommer le dossier"
        submitLabel="Renommer"
      />

      <FolderDialog
        open={!!renamingFile}
        onClose={() => setRenamingFile(null)}
        initialName={renamingFile?.file_name ?? ""}
        onSubmit={async (name) => {
          if (!renamingFile) return;
          await renameCompanyFileAction(renamingFile.id, name);
          toast.success("Fichier renommé", { description: name });
          router.refresh();
        }}
        title="Renommer le fichier"
        submitLabel="Renommer"
        fieldLabel="Nom du fichier"
      />

      <ConfirmModal
        open={!!toDeleteFile}
        onCancel={() => setToDeleteFile(null)}
        onConfirm={confirmDeleteFile}
        title="Supprimer ce fichier ?"
        description={toDeleteFile ? `« ${toDeleteFile.file_name} » sera définitivement supprimé.` : undefined}
        confirmLabel="Supprimer"
        variant="danger"
        loading={isPending}
      />

      <ConfirmModal
        open={!!toDeleteFolder}
        onCancel={() => setToDeleteFolder(null)}
        onConfirm={confirmDeleteFolder}
        title="Supprimer ce dossier ?"
        description={toDeleteFolder ? `« ${toDeleteFolder.name} » et ses sous-dossiers seront supprimés. Les fichiers qu'ils contiennent remontent à la racine, sans être supprimés.` : undefined}
        confirmLabel="Supprimer"
        variant="danger"
        loading={isPending}
      />
    </div>
  );
}
