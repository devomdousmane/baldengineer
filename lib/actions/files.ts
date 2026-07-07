"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { auditLog } from "@/lib/audit";
import { getWorkspaceUserId } from "@/lib/workspace";
import type { Market, CompanyFile, FileCategory } from "@/types/database";

const BUCKET = "company-files";

export async function getCompanyFiles(market?: Market): Promise<CompanyFile[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  let query = supabase
    .from("company_files")
    .select("*")
    .order("created_at", { ascending: false });
  if (market) query = query.eq("market", market);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as CompanyFile[];
}

export async function uploadCompanyFileAction(formData: FormData): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");
  const workspaceUserId = await getWorkspaceUserId(supabase, auth.user.id);

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("Aucun fichier fourni");

  const market = formData.get("market") as Market;
  const category = (formData.get("category") as FileCategory | null) ?? "autre";
  const folderId = (formData.get("folder_id") as string | null) || null;

  const ext = file.name.split(".").pop();
  const storagePath = `${workspaceUserId}/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type || undefined });
  if (uploadErr) throw new Error(uploadErr.message);

  const { data, error } = await supabase
    .from("company_files")
    .insert({
      user_id: workspaceUserId,
      market,
      folder_id: folderId,
      storage_path: storagePath,
      file_name: file.name,
      file_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      category,
    })
    .select("id")
    .single();

  if (error) {
    /* Rollback du fichier déjà uploadé si l'insertion en base échoue. */
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(error.message);
  }

  auditLog({ action: "file.uploaded", user_id: auth.user.id, resource_id: data.id, resource_type: "company_file" });
  revalidatePath("/fichiers");
  return { id: data.id };
}

export async function getCompanyFileUrlAction(id: string): Promise<string> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const { data: file, error: fileErr } = await supabase
    .from("company_files")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (fileErr || !file) throw new Error("Fichier introuvable");

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(file.storage_path, 60 * 5);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function renameCompanyFileAction(id: string, fileName: string): Promise<void> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const trimmed = fileName.trim();
  if (!trimmed) throw new Error("Le nom du fichier est requis");

  const { error } = await supabase
    .from("company_files")
    .update({ file_name: trimmed })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/fichiers");
}

export async function copyCompanyFileAction(id: string, folderId: string | null): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");
  const workspaceUserId = await getWorkspaceUserId(supabase, auth.user.id);

  const { data: source, error: sourceErr } = await supabase
    .from("company_files")
    .select("*")
    .eq("id", id)
    .single();
  if (sourceErr || !source) throw new Error("Fichier introuvable");

  const ext = source.file_name.split(".").pop();
  const newStoragePath = `${workspaceUserId}/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

  const { error: copyErr } = await supabase.storage
    .from(BUCKET)
    .copy(source.storage_path, newStoragePath);
  if (copyErr) throw new Error(copyErr.message);

  const { data, error } = await supabase
    .from("company_files")
    .insert({
      user_id: workspaceUserId,
      market: source.market,
      folder_id: folderId,
      storage_path: newStoragePath,
      file_name: `${source.file_name.replace(/(\.[^.]+)?$/, "")} (copie)${ext ? `.${ext}` : ""}`,
      file_type: source.file_type,
      size_bytes: source.size_bytes,
      category: source.category,
    })
    .select("id")
    .single();

  if (error) {
    await supabase.storage.from(BUCKET).remove([newStoragePath]);
    throw new Error(error.message);
  }

  auditLog({ action: "file.uploaded", user_id: auth.user.id, resource_id: data.id, resource_type: "company_file" });
  revalidatePath("/fichiers");
  return { id: data.id };
}

export async function moveCompanyFileAction(id: string, folderId: string | null): Promise<void> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("company_files")
    .update({ folder_id: folderId })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/fichiers");
}

export async function deleteCompanyFileAction(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const { data: file, error: fileErr } = await supabase
    .from("company_files")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (fileErr || !file) throw new Error("Fichier introuvable");

  await supabase.storage.from(BUCKET).remove([file.storage_path]);

  const { error } = await supabase
    .from("company_files")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  auditLog({ action: "file.deleted", user_id: auth.user.id, resource_id: id, resource_type: "company_file" });
  revalidatePath("/fichiers");
}
