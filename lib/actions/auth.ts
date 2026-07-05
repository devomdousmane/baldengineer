"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { auditLog } from "@/lib/audit";

/**
 * Origine réelle de la requête (protocole + host), dérivée des en-têtes au
 * lieu de NEXT_PUBLIC_APP_URL — cette variable est figée au build et peut
 * pointer vers une mauvaise URL selon le contexte de déploiement Netlify
 * (Production / Deploy Preview / Branch deploy) si elle n'est pas définie
 * partout à l'identique.
 */
async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? process.env.NEXT_PUBLIC_APP_URL ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  if (error) throw new Error(error.message);
  if (data.url) redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) auditLog({ action: "logout", user_id: user.id });
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}
