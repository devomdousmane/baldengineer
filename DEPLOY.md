# Déploiement — Monorepo Multi-Zones (site + saas)

Ce repo héberge deux apps Next.js indépendantes sous un même domaine public,
via le pattern [Multi-Zones](https://nextjs.org/docs/app/guides/multi-zones) :

- `site/` — portfolio vitrine, zone racine, sert `/` et toutes les routes hors `/app`
- `saas/` — BaldPro, zone secondaire, servie sous `/app/*`

Chaque zone garde son propre build, son propre `proxy.ts`/sécurité, ses propres
variables d'environnement. Elles ne partagent que le code via npm workspaces
(package.json racine) — **ce ne sont pas fusionnées en une seule app Next.js**.

## Pourquoi deux sites Netlify

Netlify (comme Vercel) ne sait pas faire tourner deux apps Next.js indépendantes
dans un seul déploiement. Le pattern Multi-Zones répond à ça avec un système de
rewrites HTTP : la zone racine (`site`) proxy les requêtes `/app/*` vers l'URL
publique de la zone secondaire (`saas`), qui est déployée séparément. Résultat
pour l'utilisateur final : un seul domaine, une navigation transparente entre
les deux zones — mais dans Netlify, ce sont bien **deux sites** distincts créés
à partir du même repo Git.

## Étapes de mise en place

### 1. Créer le site Netlify pour `saas` (zone secondaire) en premier

1. Netlify → **Add new site** → importer ce repo Git
2. Site configuration → **Base directory**: `saas` (fait que Netlify lit `saas/netlify.toml`)
3. Variables d'environnement à renseigner (Site settings → Environment variables) :
   - Toutes celles déjà utilisées en local (`saas/.env.local` : Supabase, Resend, etc.)
   - `NEXT_PUBLIC_APP_URL` = URL publique finale, ex. `https://baldengineer.fr/app` (sans slash final)
4. Déployer, récupérer l'URL Netlify générée (ex. `https://baldpro-saas.netlify.app`)

### 2. Créer le site Netlify pour `site` (zone racine)

1. Netlify → **Add new site** → même repo Git
2. **Base directory**: `site`
3. Variable d'environnement :
   - `NEXT_PUBLIC_SAAS_DEPLOY_URL` = l'URL Netlify récupérée à l'étape 1 (ex. `https://baldpro-saas.netlify.app`), sans slash final
4. Déployer
5. Attacher le domaine public final à **ce** site (c'est la zone racine qui porte le domaine visible)

### 3. Revenir sur le site `saas` et ajuster `assetPrefix`

Une fois le domaine public confirmé, dans le site Netlify `saas` :
- `NEXT_PUBLIC_SAAS_DEPLOY_URL` = l'URL Netlify réelle du site `saas` (celle de l'étape 1) — nécessaire pour que les assets statiques (`_next/static/...`) se chargent depuis le bon déploiement même si la page est vue via `/app` sur le domaine racine.

### 4. Vérification

- `https://<domaine>/` → sert le portfolio (`site`)
- `https://<domaine>/app` → doit rediriger/afficher le login BaldPro (`saas`, via rewrite)
- `https://<domaine>/app/api/...` → les routes API du SaaS restent protégées par `saas/proxy.ts` (rate limiting, CORS, headers de sécurité) — ce middleware ne s'applique qu'à cette zone, le portfolio n'est pas concerné.

## Variables d'environnement — résumé

| Zone | Variable | Valeur |
|---|---|---|
| `saas` | `NEXT_PUBLIC_APP_URL` | URL publique complète, ex. `https://baldengineer.fr/app` |
| `saas` | `NEXT_PUBLIC_SAAS_DEPLOY_URL` | URL Netlify propre à la zone `saas`, ex. `https://baldpro-saas.netlify.app` |
| `site` | `NEXT_PUBLIC_SAAS_DEPLOY_URL` | Même valeur que ci-dessus — utilisée pour les rewrites côté zone racine |

## Point de vigilance — Puppeteer / Factur-X

`saas/lib/facturx/generate-pdf.ts` bascule automatiquement entre :
- **local/build classique** → `puppeteer` complet (Chromium embarqué)
- **Netlify Functions** (détecté via `process.env.NETLIFY`) → `puppeteer-core` + `@sparticuz/chromium` (binaire compressé, compatible limite de taille serverless)

Aucune variable supplémentaire à configurer pour ce point : Netlify définit `NETLIFY=true` automatiquement dans son environnement de build/functions.

## Développement local

```bash
# Depuis la racine du repo (workspaces npm)
npm install

npm run dev:site   # portfolio sur http://localhost:3010
npm run dev:saas   # BaldPro sur http://localhost:3000 (ou 3001, voir saas/SETUP.md)
```

En local, les rewrites `/app/*` du site ne sont pas actifs par défaut (activés uniquement si
`NEXT_PUBLIC_SAAS_DEPLOY_URL` est définie) — les deux apps se testent séparément sur leurs ports respectifs.
