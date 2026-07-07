export type AuditAction =
  | "login"
  | "logout"
  | "invoice.created"
  | "invoice.exported"
  | "quote.created"
  | "client.deleted"
  | "settings.updated"
  | "facturx.generated"
  | "ai.chat"
  | "ai.scan_receipt"
  | "file.uploaded"
  | "file.deleted"
  | `email.${string}`;

export interface AuditPayload {
  action: AuditAction;
  user_id: string;
  resource_id?: string;
  resource_type?: string;
  ip?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget audit log via Supabase Edge Function.
 * Never throws — a logging failure must never block the main operation.
 */
export function auditLog(payload: AuditPayload): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.AUDIT_LOG_SECRET;
  if (!url || !secret) return;

  // Non-blocking: intentionally not awaited
  void fetch(`${url}/functions/v1/audit-log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${secret}`,
    },
    body: JSON.stringify(payload),
  }).catch(() => { /* silently discard */ });
}
