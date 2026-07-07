/**
 * Espace de travail partagé : toutes les données métier (clients, devis, factures,
 * missions, comptabilité, fichiers) et le profil d'entreprise appartiennent à un seul
 * user_id de référence, peu importe quel compte authentifié effectue l'action — le RLS
 * autorise déjà tout utilisateur connecté à voir/modifier ces données (voir migration
 * 20260707140000_shared_workspace.sql), ceci garantit en plus que les nouvelles lignes
 * créées convergent toutes vers le même propriétaire plutôt que de s'éparpiller par compte.
 */
export const WORKSPACE_REFERENCE_EMAIL = "thierno.hamza95@gmail.com";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getWorkspaceUserId(supabase: any, fallbackUserId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", WORKSPACE_REFERENCE_EMAIL)
    .maybeSingle();
  return data?.id ?? fallbackUserId;
}

/**
 * Profil d'entreprise partagé — à utiliser à la place de `profiles.eq("id", user.id)`
 * partout où l'app affiche/édite les réglages de l'entreprise (nom, IBAN, signature,
 * numérotation…), pour que tous les comptes du workspace voient et modifient le même
 * profil plutôt que leur profil individuel (qui peut ne plus exister après fusion).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getWorkspaceProfile(supabase: any, fallbackUserId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", WORKSPACE_REFERENCE_EMAIL)
    .maybeSingle();
  if (data) return data;

  const { data: fallback } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", fallbackUserId)
    .maybeSingle();
  return fallback ?? null;
}
