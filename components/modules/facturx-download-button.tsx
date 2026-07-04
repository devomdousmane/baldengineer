"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCode2, FileDown, ChevronDown, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  invoiceId: string;
  invoiceNumber: string;
}

type Status = "idle" | "loading" | "done" | "error";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function FacturXDownloadButton({ invoiceId, invoiceNumber }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const download = async (format: "pdf" | "xml") => {
    setOpen(false);
    setStatus("loading");
    try {
      const res = await fetch(`/api/factures/${invoiceId}/facturx?format=${format}`);
      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factur-x_${invoiceNumber}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="relative">
      <div className="flex items-stretch rounded-[var(--radius-md)] border border-[var(--color-border-2)] overflow-hidden">
        {/* Main button */}
        <button
          onClick={() => download("pdf")}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-2)] transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : status === "done" ? (
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
          ) : (
            <FileDown className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
          )}
          <span>
            {status === "loading" ? "Génération…" : status === "done" ? "Téléchargé !" : "Factur-X PDF"}
          </span>
        </button>

        {/* Divider */}
        <div className="w-px bg-[var(--color-border-2)]" />

        {/* Dropdown chevron */}
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={isLoading}
          className="px-2 h-8 text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] transition-colors disabled:opacity-50"
          aria-label="Autres formats"
          aria-expanded={open}
        >
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease }}
            style={{ display: "block" }}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.span>
        </button>
      </div>

      {/* Dropdown menu */}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.16, ease } }}
              exit={{ opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.12 } }}
              className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-lg)] overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-[var(--color-border)]">
                <p className="text-[10px] font-semibold text-[var(--color-text-3)] uppercase tracking-wide">Format de téléchargement</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => download("pdf")}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)] text-left hover:bg-[var(--color-bg-2)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-dim)" }}>
                    <FileDown className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text)]">PDF hybride</p>
                    <p className="text-[10px] text-[var(--color-text-3)]">PDF + XML embarqué (Factur-X)</p>
                  </div>
                </button>

                <button
                  onClick={() => download("xml")}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)] text-left hover:bg-[var(--color-bg-2)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center" style={{ backgroundColor: "var(--color-success-dim)" }}>
                    <FileCode2 className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text)]">XML seul (CII)</p>
                    <p className="text-[10px] text-[var(--color-text-3)]">Pour plateformes e-factures</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease } }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 z-50 px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium text-white whitespace-nowrap shadow-[var(--shadow-md)]"
            style={{ backgroundColor: "var(--color-danger)" }}
          >
            Erreur de génération — réessayez
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
