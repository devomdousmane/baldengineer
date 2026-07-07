"use client";

import { useEffect, useState } from "react";
import { PrintDocument } from "@/components/modules/print-document";
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

interface PreviewMessage {
  source: "baldpro-preview";
  type: "devis" | "facture";
  document: {
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
  };
  client: Client | null;
  profile: Profile | null;
}

function isPreviewMessage(data: unknown): data is PreviewMessage {
  return typeof data === "object" && data !== null && (data as { source?: unknown }).source === "baldpro-preview";
}

/**
 * Page d'aperçu isolée pour un devis/facture en cours de création (pas encore sauvegardé).
 * Chargée dans une <iframe> depuis le formulaire — reçoit les données via postMessage
 * pour rester à jour en temps réel sans jamais faire fuiter le CSS de PrintDocument
 * (global, conçu pour occuper une page entière) vers le reste de l'application.
 */
export default function PreviewPage() {
  const [message, setMessage] = useState<PreviewMessage | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (isPreviewMessage(e.data)) setMessage(e.data);
    };
    window.addEventListener("message", onMessage);
    /* Signale au parent que l'iframe est prête à recevoir les données. */
    window.parent.postMessage({ source: "baldpro-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!message) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#94A3B8", fontFamily: "system-ui, sans-serif", fontSize: 13 }}>
        En attente des données…
      </div>
    );
  }

  return (
    <PrintDocument
      type={message.type}
      hideToolbar
      document={message.document}
      client={message.client}
      profile={message.profile}
    />
  );
}
