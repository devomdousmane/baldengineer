"use client";

import { useEffect, useRef, useState } from "react";
import type { Client, Profile } from "@/types/database";

interface PreviewLine {
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
  discount_pct: number;
}

export interface PreviewDocument {
  number: string;
  title: string;
  date: string;
  dateLabel: string;
  extraDate?: string;
  extraDateLabel?: string;
  status: string;
  market: "france" | "guinee";
  currency: string;
  subtotal_ht: number;
  total_vat: number;
  total_ttc: number;
  notes?: string;
  terms?: string;
  lines: PreviewLine[];
}

interface Props {
  type: "devis" | "facture";
  document: PreviewDocument;
  client: Client | null;
  profile: Profile | null;
}

/**
 * Affiche l'aperçu fidèle (format A4, mise en page finale) d'un devis/facture en cours
 * de saisie, dans une <iframe> isolée pointant vers /print/preview. L'isolation évite
 * que le CSS global de PrintDocument (conçu pour occuper une page entière) ne fuite
 * vers le reste du formulaire. Les données sont poussées via postMessage à chaque
 * changement, pour un rendu temps réel sans recharger l'iframe.
 */
export function DocumentPreviewFrame({ type, document, client, profile }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if ((e.data as { source?: unknown })?.source === "baldpro-preview-ready") setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!ready || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { source: "baldpro-preview", type, document, client, profile },
      window.location.origin
    );
  }, [ready, type, document, client, profile]);

  return (
    <iframe
      ref={iframeRef}
      src="/print/preview"
      title="Aperçu du document"
      className="w-full h-full border-0 rounded-[var(--radius-lg)] bg-white"
      style={{ minHeight: 900 }}
    />
  );
}
