"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabase } from "@/lib/supabase/server";
import { auditLog } from "@/lib/audit";
import type { Invoice, InvoiceLine, InvoiceStatus, Market, PaymentMethod } from "@/types/database";

type LineInput = Pick<InvoiceLine,
  "position" | "description" | "quantity" | "unit" | "unit_price" | "vat_rate" | "discount_pct"
>;

export interface InvoiceInput {
  client_id: string;
  quote_id?: string;
  market: Market;
  title: string;
  date: string;
  payment_terms_days?: number;
  notes?: string;
  terms?: string;
  lines: LineInput[];
}

interface InvoiceWithLines extends Invoice {
  lines: InvoiceLine[];
}

export async function getInvoices(market?: Market, status?: InvoiceStatus): Promise<Invoice[]> {
  const supabase = await createSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  let q = supabase
    .from("invoices")
    .select("*, client:clients(id,name,email,market)")
    .eq("user_id", user.user.id)
    .order("date", { ascending: false });

  if (market) q = q.eq("market", market);
  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Invoice[];
}

export async function getInvoice(id: string): Promise<InvoiceWithLines | null> {
  const supabase = await createSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await supabase
    .from("invoices")
    .select("*, client:clients(*), lines:invoice_lines(*)")
    .eq("id", id)
    .eq("user_id", user.user.id)
    .order("position", { referencedTable: "invoice_lines" })
    .single();

  if (error) return null;
  return data as InvoiceWithLines;
}

function calcTotals(lines: LineInput[]): { subtotal_ht: number; total_vat: number; total_ttc: number } {
  let subtotal_ht = 0;
  let total_vat = 0;
  for (const l of lines) {
    const ht = Math.round(l.quantity * l.unit_price * (1 - l.discount_pct / 100) * 100) / 100;
    const vat = Math.round(ht * l.vat_rate / 100 * 100) / 100;
    subtotal_ht += ht;
    total_vat += vat;
  }
  return {
    subtotal_ht: Math.round(subtotal_ht * 100) / 100,
    total_vat: Math.round(total_vat * 100) / 100,
    total_ttc: Math.round((subtotal_ht + total_vat) * 100) / 100,
  };
}

async function nextInvoiceNumber(supabase: Awaited<ReturnType<typeof createSupabase>>, userId: string, market: Market): Promise<string> {
  const col = market === "france" ? "invoice_counter_fr" : "invoice_counter_gn";
  const pfxCol = market === "france" ? "invoice_prefix_fr" : "invoice_prefix_gn";

  const { data } = await supabase
    .from("profiles")
    .select(`${col}, ${pfxCol}`)
    .eq("id", userId)
    .single();

  if (!data) throw new Error("Profil introuvable");

  const counter: number = (data as Record<string, number>)[col];
  const prefix: string = (data as Record<string, string>)[pfxCol];
  const number = `${prefix}${String(counter).padStart(4, "0")}`;

  await supabase.from("profiles").update({ [col]: counter + 1 }).eq("id", userId);
  return number;
}

export async function createInvoiceAction(payload: InvoiceInput): Promise<{ id: string }> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const number = await nextInvoiceNumber(supabase, auth.user.id, payload.market);
  const currency = payload.market === "france" ? "EUR" : "GNF";
  const totals = calcTotals(payload.lines);

  /* due_date = date + payment_terms_days */
  const dateObj = new Date(payload.date);
  dateObj.setDate(dateObj.getDate() + (payload.payment_terms_days ?? 30));
  const due_date = dateObj.toISOString().slice(0, 10);

  const { data: invoice, error: iErr } = await supabase
    .from("invoices")
    .insert({
      user_id: auth.user.id,
      client_id: payload.client_id,
      quote_id: payload.quote_id ?? null,
      market: payload.market,
      number,
      title: payload.title,
      date: payload.date,
      due_date,
      currency,
      notes: payload.notes ?? null,
      terms: payload.terms ?? null,
      ...totals,
    })
    .select("id")
    .single();

  if (iErr) throw new Error(iErr.message);

  if (payload.lines.length > 0) {
    const { error: lErr } = await supabase.from("invoice_lines").insert(
      payload.lines.map((l) => ({ ...l, invoice_id: invoice.id }))
    );
    if (lErr) throw new Error(lErr.message);
  }

  auditLog({ action: "invoice.created", user_id: auth.user.id, resource_id: invoice.id, resource_type: "invoice" });
  revalidatePath("/factures");
  return { id: invoice.id };
}

export async function markInvoicePaidAction(
  id: string,
  amount: number,
  method: PaymentMethod
): Promise<void> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const invoice = await getInvoice(id);
  if (!invoice) throw new Error("Facture introuvable");

  const newPaid = invoice.paid_amount + amount;
  const status: InvoiceStatus = newPaid >= invoice.total_ttc ? "paid" : "partial";

  const { error } = await supabase
    .from("invoices")
    .update({
      paid_amount: newPaid,
      status,
      payment_method: method,
      paid_at: status === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) throw new Error(error.message);

  /* Create accounting entry */
  await supabase.from("accounting_entries").insert({
    user_id: auth.user.id,
    market: invoice.market,
    type: "income",
    category: "facturation",
    label: `Paiement ${invoice.number}`,
    amount,
    currency: invoice.currency,
    date: new Date().toISOString().slice(0, 10),
    invoice_id: id,
  });

  revalidatePath("/factures");
  revalidatePath(`/factures/${id}`);
  revalidatePath("/comptabilite");
}

export async function updateInvoiceStatusAction(id: string, status: InvoiceStatus): Promise<void> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const extra: Partial<Record<string, string>> = {};
  if (status === "sent") extra.sent_at = new Date().toISOString();

  const { error } = await supabase
    .from("invoices")
    .update({ status, ...extra })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/factures");
  revalidatePath(`/factures/${id}`);
}

/* ── France: Factur-X / Chorus Pro submission ── */
export async function submitFacturXAction(invoiceId: string): Promise<void> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const invoice = await getInvoice(invoiceId);
  if (!invoice) throw new Error("Facture introuvable");
  if (invoice.market !== "france") throw new Error("Factur-X disponible uniquement en France");

  /* Mark as pending — real submission via Chorus Pro API in production */
  const { error } = await supabase
    .from("invoices")
    .update({ facturx_status: "pending" })
    .eq("id", invoiceId)
    .eq("user_id", auth.user.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/factures/${invoiceId}`);
}
