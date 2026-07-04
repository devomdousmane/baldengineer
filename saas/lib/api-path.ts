/**
 * Préfixe un chemin avec le basePath Next.js ("/app", voir next.config.ts).
 * Nécessaire pour tout chemin absolu construit manuellement — fetch(), et les
 * redirections NextResponse.redirect()/NextResponse.next() qui, contrairement
 * à next/link et router.push, n'appliquent jamais basePath automatiquement.
 *
 * Garder cette valeur synchronisée avec `basePath` dans next.config.ts.
 */
const BASE_PATH = "/app";

export function apiPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
