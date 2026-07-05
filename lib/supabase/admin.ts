import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé service_role — contourne RLS.
 * Réservé aux endroits où l'accès n'est PAS lié à une session utilisateur
 * (ex: résolution d'un document par token public). Ne jamais exposer ce
 * client côté navigateur, ni l'utiliser pour des opérations liées à
 * auth.uid() — dans ce cas, toujours utiliser lib/supabase/server.ts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants");
  }
  return createSupabaseClient<any>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
