"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabase } from "@/lib/supabase/server";
import { getWorkspaceUserId } from "@/lib/workspace";
import type { Mission, MissionStatus, Market } from "@/types/database";

type MissionInput = Pick<Mission,
  "client_id" | "market" | "title" | "description" | "status" |
  "start_date" | "end_date" | "daily_rate" | "estimated_days" | "currency" | "notes"
>;

export async function getMissions(market?: Market, status?: MissionStatus): Promise<Mission[]> {
  const supabase = await createSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  let q = supabase
    .from("missions")
    .select("*, client:clients(id,name,market)")
    .order("created_at", { ascending: false });

  if (market) q = q.eq("market", market);
  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Mission[];
}

export async function getMission(id: string): Promise<Mission | null> {
  const supabase = await createSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await supabase
    .from("missions")
    .select("*, client:clients(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Mission;
}

export async function createMissionAction(payload: Omit<MissionInput, "status">): Promise<{ id: string }> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");
  const workspaceUserId = await getWorkspaceUserId(supabase, auth.user.id);

  const { data, error } = await supabase
    .from("missions")
    .insert({ ...payload, status: "pending", user_id: workspaceUserId })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/missions");
  return { id: data.id };
}

export async function updateMissionStatusAction(id: string, status: MissionStatus): Promise<void> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("missions")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/missions");
  revalidatePath(`/missions/${id}`);
}

export async function updateMissionAction(id: string, payload: Partial<MissionInput>): Promise<void> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("missions")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/missions");
  revalidatePath(`/missions/${id}`);
}

export async function deleteMissionAction(id: string): Promise<void> {
  const supabase = await createSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("missions")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/missions");
}
