"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ScanLine, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { uploadCompanyFileAction } from "@/lib/actions/files";
import type { Market, FileCategory } from "@/types/database";

const CATEGORIES: { value: FileCategory; label: string }[] = [
  { value: "facture", label: "Facture" },
  { value: "contrat", label: "Contrat" },
  { value: "rib", label: "RIB" },
  { value: "justificatif", label: "Justificatif" },
  { value: "autre", label: "Autre" },
];

export interface ScannedReceipt {
  label: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  confidence: "high" | "medium" | "low";
}

interface Props {
  open: boolean;
  onClose: () => void;
  defaultMarket: Market;
  /** Dossier courant de l'explorateur — le fichier y est déposé directement. */
  folderId?: string | null;
  onUploaded?: () => void;
  /** Si fourni, un bouton "Scanner" tente l'extraction IA puis renvoie les données trouvées.
      `market` est celui choisi par l'utilisateur dans ce formulaire — fiable, à préférer à
      toute déduction depuis la devise détectée par l'IA (qui peut se tromper). */
  onScanned?: (data: ScannedReceipt, fileId: string, market: Market) => void;
}

export function UploadFileDialog({ open, onClose, defaultMarket, folderId = null, onUploaded, onScanned }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [market, setMarket] = useState<Market>(defaultMarket);
  const [category, setCategory] = useState<FileCategory>("autre");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();
  const [isScanning, setIsScanning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useFocusTrap(dialogRef, { open, onEscape: onClose });

  /* Portail vers document.body : évite qu'un ancêtre animé par Framer Motion (ex. le Header,
     qui applique un transform CSS) ne piège le `position: fixed` de la modale et la décale. */
  useEffect(() => setMounted(true), []);

  const reset = () => {
    setFile(null);
    setError(null);
    setCategory("autre");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const upload = (currentFile: File, finalCategory: FileCategory): Promise<string> => {
    setError(null);
    return new Promise<string>((resolve, reject) => {
      startUpload(async () => {
        try {
          const formData = new FormData();
          formData.set("file", currentFile);
          formData.set("market", market);
          formData.set("category", finalCategory);
          if (folderId) formData.set("folder_id", folderId);
          const { id } = await uploadCompanyFileAction(formData);
          resolve(id);
        } catch (err) {
          reject(err instanceof Error ? err : new Error("Échec de l'envoi"));
        }
      });
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await upload(file, category);
      onUploaded?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi");
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setError(null);
    setIsScanning(true);
    try {
      const fileId = await upload(file, "facture");
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/ai/scan-receipt", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec du scan");
      onScanned?.(data as ScannedReceipt, fileId, market);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du scan");
    } finally {
      setIsScanning(false);
    }
  };

  const isBusy = isUploading || isScanning;

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
          onClick={isBusy ? undefined : handleClose}
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
            aria-label="Ajouter un fichier"
            className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-xl)]"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Ajouter un fichier</h2>
              <button
                onClick={handleClose}
                disabled={isBusy}
                aria-label="Fermer"
                className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-3)] hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-border)] py-8 text-center hover:border-[var(--color-accent)] transition-colors cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-6 h-6 text-[var(--color-text-3)]" />
                <span className="text-sm text-[var(--color-text-2)]">
                  {file ? file.name : "Cliquez pour choisir un fichier"}
                </span>
                <span className="text-xs text-[var(--color-text-3)]">PDF, Word, Excel, image — 10 Mo max</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select label="Marché" value={market} onChange={(e) => setMarket(e.target.value as Market)}>
                  <option value="france">🇫🇷 France</option>
                  <option value="guinee">🇬🇳 Guinée</option>
                </Select>
                <Select label="Catégorie" value={category} onChange={(e) => setCategory(e.target.value as FileCategory)}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
              </div>

              {error && (
                <p className="flex items-center gap-1.5 text-xs text-[var(--color-danger)] bg-[var(--color-danger-dim)] px-3 py-2 rounded-[var(--radius-md)]">
                  <FileWarning className="w-3.5 h-3.5 shrink-0" /> {error}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-6">
              {onScanned && (
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={<ScanLine className="w-3.5 h-3.5" />}
                  onClick={handleScan}
                  disabled={!file || isBusy}
                  loading={isScanning}
                >
                  Scanner et créer une écriture comptable
                </Button>
              )}
              <Button size="sm" onClick={handleUpload} disabled={!file || isBusy} loading={isUploading}>
                Enregistrer le fichier
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
