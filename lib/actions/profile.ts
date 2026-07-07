"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { auditLog } from "@/lib/audit";
import type { Profile, Market } from "@/types/database";

type ProfileUpdate = Partial<Pick<Profile,
  "company_name" | "company_siren" | "company_nif" | "company_address" |
  "company_city" | "company_zip" | "company_country" | "company_phone" |
  "company_email" | "company_website" | "vat_number" | "default_market" |
  "invoice_prefix_fr" | "invoice_prefix_gn" | "quote_prefix_fr" | "quote_prefix_gn" |
  "payment_terms_days" | "bank_name" | "bank_iban" | "bank_bic" | "legal_mention"
>>;

export async function updateProfileAction(payload: ProfileUpdate): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("profiles")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  auditLog({ action: "settings.updated", user_id: user.id });
  revalidatePath("/settings");
}

export async function updateDefaultMarketAction(market: Market): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("profiles")
    .update({ default_market: market, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateSignatureAction(dataUrl: string | null): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("profiles")
    .update({ signature_data_url: dataUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  auditLog({ action: "settings.updated", user_id: user.id });
  revalidatePath("/settings");
  revalidatePath("/devis/new");
  revalidatePath("/factures/new");
}
