"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Market } from "@/types/database";

interface AccountingEntryInput {
  market: Market;
  type: "income" | "expense";
  category: string;
  label: string;
  amount: number;
  date: string;
  reference?: string;
  notes?: string;
}

export async function createAccountingEntryAction(payload: AccountingEntryInput): Promise<void> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency_fr, currency_gn")
    .eq("id", auth.user.id)
    .single();

  const currency = payload.market === "france"
    ? (profile?.currency_fr ?? "EUR")
    : (profile?.currency_gn ?? "GNF");

  const { error } = await supabase.from("accounting_entries").insert({
    user_id: auth.user.id,
    market: payload.market,
    type: payload.type,
    category: payload.category,
    label: payload.label,
    amount: payload.amount,
    currency,
    date: payload.date,
    reference: payload.reference ?? null,
    notes: payload.notes ?? null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/comptabilite");
}

export async function deleteAccountingEntryAction(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("accounting_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/comptabilite");
}
