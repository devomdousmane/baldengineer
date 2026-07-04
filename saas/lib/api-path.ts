/**
 * Préfixe un chemin d'API avec le basePath Next.js ("/app", voir next.config.ts).
 * Nécessaire car `fetch()` n'applique pas automatiquement basePath, contrairement
 * à next/link et router.push. Sans ce préfixe, tout fetch("/api/...") appelle
 * la racine du domaine au lieu de la zone SaaS en Multi-Zones.
 *
 * Garder cette valeur synchronisée avec `basePath` dans next.config.ts.
 */
const BASE_PATH = "/app";

export function apiPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
