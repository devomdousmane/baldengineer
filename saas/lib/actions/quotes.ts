"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabase } from "@/lib/supabase/server";
import { auditLog } from "@/lib/audit";
import type { Quote, QuoteLine, QuoteStatus, Market } from "@/types/database";

type LineInput = Pick<QuoteLine,
  "position" | "description" | "quantity" | "unit" | "unit_price" | "vat_rate" | "discount_pct"
>;

interface QuoteInput {
  client_id: string;
  market: Market;
  title: string;
  date: string;
  valid_until: string;
  notes?: string;
  terms?: string;
  lines: LineInput[];
}

interface QuoteWithLines extends Quote {
  lines: QuoteLine[];
}

export async function getQuotes(market?: Market, status?: QuoteStatus): Promise<Quote[]> {
  const supabase = await createSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  let q = supabase
    .from("quotes")
    .select("*, client:clients(id,name,email,market)")
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false });

  if (market) q = q.eq("market", market);
  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Quote[];
}

export async function getQuote(id: string): Promise<QuoteWithLines | null> {
  const supabase = await createSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await supabase
    .from("quotes")
    .select("*, client:clients(*), lines:quote_lines(*)")
    .eq("id", id)
    .eq("user_id", user.user.id)
    .order("position", { referencedTable: "quote_lines" })
    .single();

  if (error) return null;
  return data as QuoteWithLines;
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

async function nextQuoteNumber(supabase: Awaited<ReturnType<typeof createSupabase>>, userId: string, market: Market): Promise<string> {
  const col = market === "france" ? "quote_counter_fr" : "quote_counter_gn";
  const pfxCol = market === "france" ? "quote_prefix_fr" : "quote_prefix_gn";

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

export async function createQuoteAction(payload: QuoteInput): Promise<{ id: string }> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const number = await nextQuoteNumber(supabase, auth.user.id, payload.market);
  const currency = payload.market === "france" ? "EUR" : "GNF";
  const totals = calcTotals(payload.lines);

  const { data: quote, error: qErr } = await supabase
    .from("quotes")
    .insert({
      user_id: auth.user.id,
      client_id: payload.client_id,
      market: payload.market,
      number,
      title: payload.title,
      date: payload.date,
      valid_until: payload.valid_until,
      currency,
      notes: payload.notes ?? null,
      terms: payload.terms ?? null,
      ...totals,
    })
    .select("id")
    .single();

  if (qErr) throw new Error(qErr.message);

  if (payload.lines.length > 0) {
    const { error: lErr } = await supabase.from("quote_lines").insert(
      payload.lines.map((l) => ({ ...l, quote_id: quote.id }))
    );
    if (lErr) throw new Error(lErr.message);
  }

  auditLog({ action: "quote.created", user_id: auth.user.id, resource_id: quote.id, resource_type: "quote" });
  revalidatePath("/devis");
  return { id: quote.id };
}

export async function updateQuoteStatusAction(id: string, status: QuoteStatus): Promise<void> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const timestampField: Partial<Record<QuoteStatus, string>> = {
    sent: "sent_at",
    accepted: "accepted_at",
    refused: "refused_at",
  };

  const extra: Record<string, string> = {};
  const field = timestampField[status];
  if (field) extra[field] = new Date().toISOString();

  const { error } = await supabase
    .from("quotes")
    .update({ status, ...extra })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/devis");
  revalidatePath(`/devis/${id}`);
}

export async function convertQuoteToInvoiceAction(quoteId: string): Promise<{ invoiceId: string }> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const quote = await getQuote(quoteId);
  if (!quote) throw new Error("Devis introuvable");
  if (quote.converted_to_invoice_id) throw new Error("Devis déjà converti");

  /* Import invoice action to reuse counter logic */
  const { createInvoiceAction } = await import("./invoices");
  const { id: invoiceId } = await createInvoiceAction({
    client_id: quote.client_id,
    quote_id: quoteId,
    market: quote.market,
    title: quote.title,
    date: new Date().toISOString().slice(0, 10),
    notes: quote.notes ?? undefined,
    terms: quote.terms ?? undefined,
    lines: (quote.lines ?? []).map((l) => ({
      position: l.position,
      description: l.description,
      quantity: l.quantity,
      unit: l.unit,
      unit_price: l.unit_price,
      vat_rate: l.vat_rate,
      discount_pct: l.discount_pct,
    })),
  });

  await supabase
    .from("quotes")
    .update({ converted_to_invoice_id: invoiceId, status: "accepted" })
    .eq("id", quoteId)
    .eq("user_id", auth.user.id);

  revalidatePath("/devis");
  revalidatePath("/factures");
  return { invoiceId };
}
