"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Folder, Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/lib/use-focus-trap";
import type { CompanyFolder } from "@/types/database";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (targetFolderId: string | null) => Promise<void>;
  folders: CompanyFolder[];
  /** Dossier de l'élément déplacé — exclu (et ses descendants) des destinations proposées. */
  excludeFolderId?: string;
  itemName: string;
}

/** Modale de sélection d'un dossier de destination — navigation arborescente simple. */
export function MoveItemDialog({ open, onClose, onSubmit, folders, excludeFolderId, itemName }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (open) setCurrentId(null); }, [open]);
  useFocusTrap(dialogRef, { open, onEscape: onClose });

  /* Exclut le dossier lui-même et tous ses descendants — on ne peut pas le déplacer en lui-même. */
  const excludedIds = useMemo(() => {
    if (!excludeFolderId) return new Set<string>();
    const ids = new Set([excludeFolderId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const f of folders) {
        if (f.parent_id && ids.has(f.parent_id) && !ids.has(f.id)) {
          ids.add(f.id);
          changed = true;
        }
      }
    }
    return ids;
  }, [folders, excludeFolderId]);

  const visibleFolders = folders.filter((f) => f.parent_id === currentId && !excludedIds.has(f.id));

  const breadcrumb = useMemo(() => {
    const trail: CompanyFolder[] = [];
    let cursor = folders.find((f) => f.id === currentId) ?? null;
    while (cursor) {
      trail.unshift(cursor);
      cursor = folders.find((f) => f.id === cursor!.parent_id) ?? null;
    }
    return trail;
  }, [folders, currentId]);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await onSubmit(currentId);
      onClose();
    } finally {
      setIsPending(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={isPending ? undefined : onClose}
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Déplacer vers"
            className="w-full max-w-sm max-h-[calc(100dvh-2rem)] flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-xl)]"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Déplacer « {itemName} »</h2>
              <button
                onClick={onClose}
                disabled={isPending}
                aria-label="Fermer"
                className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-3)] mb-4">Choisissez le dossier de destination.</p>

            <div className="flex items-center gap-1 text-xs text-[var(--color-text-2)] flex-wrap mb-2">
              <button
                onClick={() => setCurrentId(null)}
                className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              >
                <Home className="w-3 h-3" /> Racine
              </button>
              {breadcrumb.map((f) => (
                <span key={f.id} className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[var(--color-text-3)]" />
                  <button
                    onClick={() => setCurrentId(f.id)}
                    className="px-2 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                  >
                    {f.name}
                  </button>
                </span>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto min-h-[120px] rounded-[var(--radius-md)] border border-[var(--color-border)] p-2 space-y-0.5">
              {visibleFolders.length === 0 ? (
                <p className="text-xs text-[var(--color-text-3)] text-center py-6">Aucun sous-dossier ici</p>
              ) : (
                visibleFolders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCurrentId(f.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[var(--radius-md)] text-sm text-left hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer"
                  >
                    <Folder className="w-4 h-4 shrink-0 text-[var(--color-accent)]" fill="currentColor" fillOpacity={0.15} />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))
              )}
            </div>

            <Button size="sm" className="w-full mt-4" onClick={handleConfirm} loading={isPending}>
              Déplacer ici
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
