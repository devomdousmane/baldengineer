"use server";

import { createClient as createSupabase } from "@/lib/supabase/server";
import type { Market, QuoteStatus, InvoiceStatus } from "@/types/database";

export type EmailLogType =
  | "devis_envoye" | "devis_relance"
  | "facture_envoyee" | "relance_paiement" | "paiement_recu" | "paiement_notif_admin";

export interface EmailLogEntry {
  id: string;
  createdAt: string;
  type: EmailLogType;
  toEmail: string;
  subject: string;
  status: "sent" | "failed" | "delivered" | "bounced";
  errorMessage: string | null;
  resourceId: string;
  resourceType: "quote" | "invoice";
  /** Numéro et statut actuel du devis/facture, s'il existe encore. */
  documentNumber: string | null;
  documentStatus: QuoteStatus | InvoiceStatus | null;
  clientName: string | null;
}

const DOC_TYPES: EmailLogType[] = [
  "devis_envoye", "devis_relance",
  "facture_envoyee", "relance_paiement", "paiement_recu", "paiement_notif_admin",
];

/** Historique des emails de devis/factures envoyés, avec le statut actuel du document. */
export async function getEmailLogs(market?: Market): Promise<EmailLogEntry[]> {
  const supabase = await createSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data: logs, error } = await supabase
    .from("email_logs")
    .select("*")
    .eq("user_id", user.user.id)
    .in("type", DOC_TYPES)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  if (!logs || logs.length === 0) return [];

  const quoteIds = logs.filter((l) => l.resource_type === "quote").map((l) => l.resource_id);
  const invoiceIds = logs.filter((l) => l.resource_type === "invoice").map((l) => l.resource_id);

  interface DocRow {
    id: string;
    number: string;
    status: QuoteStatus | InvoiceStatus;
    market: Market;
    client: { name: string } | { name: string }[] | null;
  }

  /* Le join client:clients(name) peut être inféré comme objet unique ou tableau selon la contrainte FK. */
  function clientName(client: DocRow["client"]): string | null {
    if (!client) return null;
    return Array.isArray(client) ? (client[0]?.name ?? null) : client.name;
  }

  const [quotesRes, invoicesRes] = await Promise.all([
    quoteIds.length
      ? supabase.from("quotes").select("id, number, status, market, client:clients(name)").in("id", quoteIds)
      : Promise.resolve({ data: [] as DocRow[] }),
    invoiceIds.length
      ? supabase.from("invoices").select("id, number, status, market, client:clients(name)").in("id", invoiceIds)
      : Promise.resolve({ data: [] as DocRow[] }),
  ]);

  const quoteMap = new Map((quotesRes.data ?? []).map((q) => [q.id, q as DocRow]));
  const invoiceMap = new Map((invoicesRes.data ?? []).map((i) => [i.id, i as DocRow]));

  const entries: EmailLogEntry[] = logs.map((log) => {
    const doc = log.resource_type === "quote" ? quoteMap.get(log.resource_id) : invoiceMap.get(log.resource_id);
    return {
      id: log.id,
      createdAt: log.created_at,
      type: log.type as EmailLogType,
      toEmail: log.to_email,
      subject: log.subject,
      status: log.status,
      errorMessage: log.error_message,
      resourceId: log.resource_id,
      resourceType: log.resource_type,
      documentNumber: doc?.number ?? null,
      documentStatus: doc?.status ?? null,
      clientName: doc ? clientName(doc.client) : null,
    };
  });

  if (market) {
    return entries.filter((e) => {
      const doc = e.resourceType === "quote" ? quoteMap.get(e.resourceId) : invoiceMap.get(e.resourceId);
      return doc?.market === market;
    });
  }

  return entries;
}
