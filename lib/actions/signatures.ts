"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Signature électronique côté client, depuis la page publique /view/[type]/[token] —
 * aucune session utilisateur : le token non-devinable dans l'URL fait office d'autorisation,
 * exactement comme pour la simple consultation du document. Utilise le client service_role
 * car ces routes publiques n'ont pas de contexte auth.uid().
 */
export async function signQuoteAction(token: string, dataUrl: string, signerName: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: quote, error: findErr } = await supabase
    .from("quotes")
    .select("id, status")
    .eq("public_token", token)
    .single();
  if (findErr || !quote) throw new Error("Devis introuvable");

  const { error } = await supabase
    .from("quotes")
    .update({
      signature_data_url: dataUrl,
      signer_name: signerName.trim() || null,
      signed_at: new Date().toISOString(),
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", quote.id);
  if (error) throw new Error(error.message);

  revalidatePath(`/view/devis/${token}`);
  revalidatePath("/devis");
}

export async function refuseQuoteAction(token: string, reason: string): Promise<void> {
  const supabase = createAdminClient();

  const trimmed = reason.trim();
  if (!trimmed) throw new Error("Merci de préciser le motif du refus");

  const { data: quote, error: findErr } = await supabase
    .from("quotes")
    .select("id")
    .eq("public_token", token)
    .single();
  if (findErr || !quote) throw new Error("Devis introuvable");

  const { error } = await supabase
    .from("quotes")
    .update({
      status: "refused",
      refused_at: new Date().toISOString(),
      refusal_reason: trimmed,
    })
    .eq("id", quote.id);
  if (error) throw new Error(error.message);

  revalidatePath(`/view/devis/${token}`);
  revalidatePath("/devis");
}

export async function signInvoiceAction(token: string, dataUrl: string, signerName: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: invoice, error: findErr } = await supabase
    .from("invoices")
    .select("id")
    .eq("public_token", token)
    .single();
  if (findErr || !invoice) throw new Error("Facture introuvable");

  const { error } = await supabase
    .from("invoices")
    .update({
      signature_data_url: dataUrl,
      signer_name: signerName.trim() || null,
      signed_at: new Date().toISOString(),
    })
    .eq("id", invoice.id);
  if (error) throw new Error(error.message);

  revalidatePath(`/view/factures/${token}`);
  revalidatePath("/factures");
}
