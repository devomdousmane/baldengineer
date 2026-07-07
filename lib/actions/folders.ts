"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Market, CompanyFolder } from "@/types/database";

export async function getCompanyFolders(market: Market): Promise<CompanyFolder[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase
    .from("company_folders")
    .select("*")
    .eq("user_id", auth.user.id)
    .eq("market", market)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data as CompanyFolder[];
}

export async function createFolderAction(name: string, market: Market, parentId: string | null): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Le nom du dossier est requis");

  const { data, error } = await supabase
    .from("company_folders")
    .insert({ user_id: auth.user.id, market, parent_id: parentId, name: trimmed })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/fichiers");
  return { id: data.id };
}

export async function renameFolderAction(id: string, name: string): Promise<void> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Le nom du dossier est requis");

  const { error } = await supabase
    .from("company_folders")
    .update({ name: trimmed })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/fichiers");
}

/**
 * Déplace un dossier vers un autre parent (ou la racine si null).
 * Refuse de déplacer un dossier dans lui-même ou l'un de ses propres descendants,
 * ce qui créerait un cycle dans l'arborescence.
 */
export async function moveFolderAction(id: string, newParentId: string | null): Promise<void> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  if (newParentId === id) throw new Error("Un dossier ne peut pas être déplacé dans lui-même");

  if (newParentId) {
    const { data: allFolders, error: listErr } = await supabase
      .from("company_folders")
      .select("id, parent_id")
      .eq("user_id", auth.user.id);
    if (listErr) throw new Error(listErr.message);

    let cursor = allFolders?.find((f) => f.id === newParentId) ?? null;
    while (cursor) {
      if (cursor.id === id) throw new Error("Impossible de déplacer un dossier dans l'un de ses sous-dossiers");
      cursor = allFolders?.find((f) => f.id === cursor!.parent_id) ?? null;
    }
  }

  const { error } = await supabase
    .from("company_folders")
    .update({ parent_id: newParentId })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/fichiers");
}

/**
 * Supprime un dossier. Les sous-dossiers sont supprimés en cascade (contrainte FK),
 * et les fichiers qu'il contenait (direct ou via sous-dossiers) remontent à la racine
 * plutôt que d'être supprimés (ON DELETE SET NULL sur company_files.folder_id) —
 * aucune perte de fichier, seule l'organisation en dossier est retirée.
 */
export async function deleteFolderAction(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("company_folders")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/fichiers");
}
