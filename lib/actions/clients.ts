"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabase } from "@/lib/supabase/server";
import { getWorkspaceUserId } from "@/lib/workspace";
import type { Client, Market } from "@/types/database";

type ClientInsert = Pick<Client,
  "name" | "market" | "type" | "email" | "phone" |
  "address" | "city" | "zip" | "country" |
  "siren" | "nif" | "vat_number" | "notes"
>;

export async function getClients(market?: Market): Promise<Client[]> {
  const supabase = await createSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  let q = supabase
    .from("clients")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (market) q = q.eq("market", market);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = await createSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function createClientAction(payload: ClientInsert): Promise<{ id: string }> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");
  const workspaceUserId = await getWorkspaceUserId(supabase, auth.user.id);

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...payload, user_id: workspaceUserId })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  return { id: data.id };
}

export async function updateClientAction(id: string, payload: Partial<ClientInsert>): Promise<void> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("clients")
    .update(payload)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
}

export async function archiveClientAction(id: string): Promise<void> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("clients")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/clients");
}
