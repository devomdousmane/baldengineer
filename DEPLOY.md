# Déploiement — deux sites Netlify indépendants

Le projet est réparti sur deux repos GitHub complètement indépendants :

- **`baldengineer`** (ce repo) — SaaS BaldPro, déployé sur `app.baldengineer.fr`
- **`baldengineer-site`** — site vitrine, déployé sur `baldengineer.fr`

Chacun a son propre build Next.js, ses propres dépendances, son propre domaine. Aucun `basePath`,
aucun rewrite, aucune configuration croisée — deux apps totalement autonomes.

## 1. Déployer le SaaS (ce repo)

1. Netlify → **Add new site → Import an existing project** → repo `baldengineer`
2. Build settings détectés automatiquement (Next.js) — pas de `Base directory` à préciser
3. **Site settings → Environment variables**, ajouter (valeurs dans `.env.local`) :

   | Variable | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://nmophdkhtkeftwjbzdxt.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | (voir `.env.local`) |
   | `ACCESS_TOKEN_SECRET` | (voir `.env.local`) |
   | `AUDIT_LOG_SECRET` | (voir `.env.local`) |
   | `SUPABASE_SERVICE_ROLE_KEY` | (voir `.env.local`) |
   | `RESEND_API_KEY` | (voir `.env.local`) |
   | `EMAIL_FROM` | `BaldEngineer<noreply@send.baldengineer.fr>` |
   | `NEXT_PUBLIC_APP_URL` | `https://app.baldengineer.fr` |
   | `NEXT_PUBLIC_SITE_URL` | `https://baldengineer.fr` |

4. Déployer
5. **Site settings → Domain management → Add a custom domain** → `app.baldengineer.fr`, suivre les instructions DNS de Netlify (CNAME)

## 2. Déployer le site vitrine (`baldengineer-site`)

1. Netlify → **Add new site → Import an existing project** → repo `baldengineer-site`
2. Build settings détectés automatiquement
3. **Environment variables** :

   | Variable | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SAAS_URL` | `https://app.baldengineer.fr` |

4. Déployer
5. **Domain management → Add a custom domain** → `baldengineer.fr`

## 3. Configurer les redirections OAuth Supabase

**Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**, ajouter :
```
https://app.baldengineer.fr/auth/callback
```
(en plus de l'URL de dev locale déjà présente)

## Vérification

- `https://baldengineer.fr` → portfolio
- `https://app.baldengineer.fr/login` → login BaldPro
- Bouton "Espace client" (site) → mène vers le SaaS
- Bouton "Retour au site" (sidebar SaaS) → mène vers le site vitrine
- Connexion Google, création d'un devis/facture, envoi d'email fonctionnent

## Point de vigilance — Puppeteer / Factur-X

`lib/facturx/generate-pdf.ts` bascule automatiquement entre :
- **local/build classique** → `puppeteer` complet (Chromium embarqué)
- **Netlify Functions** (détecté via `process.env.NETLIFY`) → `puppeteer-core` + `@sparticuz/chromium` (binaire compressé, compatible limite de taille serverless)

Aucune configuration supplémentaire nécessaire — Netlify définit `NETLIFY=true` automatiquement.

## Développement local

```bash
# Dans ce repo (SaaS)
npm install
npm run dev   # http://localhost:3000

# Dans baldengineer-site (site vitrine)
npm install
npm run dev   # http://localhost:3010
```

En local, `NEXT_PUBLIC_APP_URL`/`NEXT_PUBLIC_SITE_URL`/`NEXT_PUBLIC_SAAS_URL` pointent vers les ports
locaux respectifs (voir `.env.local` de chaque projet) — pas de rewrite ni de proxy nécessaire, chaque
app est indépendante même en développement.
