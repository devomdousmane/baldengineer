# BaldPro SaaS — Guide de démarrage

## 1. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → New project
2. Copier les clés dans `.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XXXX...
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

## 2. Exécuter le schéma SQL

Dans Supabase → **SQL Editor**, coller et exécuter le fichier `lib/schema.sql`.

## 3. Configurer l'authentification Google

Dans Supabase → **Authentication → Providers → Google** :
- Activer Google
- Ajouter l'URL de redirection : `http://localhost:3001/auth/callback`
- Dans [Google Cloud Console](https://console.cloud.google.com), créer des identifiants OAuth 2.0 et renseigner le Client ID / Secret dans Supabase

## 4. Lancer le serveur de développement

```bash
npm run dev
```

## 5. Générer les types TypeScript depuis Supabase (optionnel)

```bash
npx supabase gen types typescript --project-id VOTRE_PROJECT_ID > types/supabase-gen.ts
```

## 6. Configurer l'envoi d'emails (Resend)

L'envoi de devis, factures, relances et notifications par email passe par [Resend](https://resend.com).

1. Créer un compte sur [resend.com](https://resend.com) et vérifier votre domaine d'envoi (SPF/DKIM)
2. Récupérer la clé API : **API Keys** → [resend.com/api-keys](https://resend.com/api-keys)
3. Ajouter dans `.env.local` :
   ```
   RESEND_API_KEY=re_XXXX...
   EMAIL_FROM=BaldPro <noreply@votredomaine.com>
   ```

`EMAIL_FROM` doit utiliser une adresse du domaine vérifié dans Resend. En développement, `onboarding@resend.dev` peut être utilisé pour tester sans domaine vérifié.

## Architecture

```
├── app/
│   ├── login/           → Page de connexion Google
│   ├── auth/callback/   → Callback OAuth
│   └── (dashboard)/
│       ├── page.tsx         → Tableau de bord (KPIs + graphique)
│       ├── clients/         → Gestion clients (FR + GN)
│       ├── devis/           → Devis (création, suivi, conversion)
│       ├── factures/        → Factures + Factur-X (France)
│       ├── missions/        → Suivi missions
│       ├── comptabilite/    → Écritures comptables
│       └── settings/        → Paramètres profil / entreprise
├── lib/
│   ├── supabase/        → Client (browser + server + middleware)
│   ├── actions/         → Server Actions typées (auth, clients, devis, factures, missions, dashboard)
│   └── schema.sql       → Schéma Supabase complet (RLS inclus)
├── components/
│   ├── ui/              → Badge, Button, Card, KpiCard, DataTable
│   └── layout/          → Sidebar, Header
└── types/database.ts    → Types TypeScript complets
```

## France — Factur-X

La colonne `facturx_status` sur les factures suit le cycle :
`none → pending → submitted → acknowledged | rejected`

L'action `submitFacturXAction` marque la facture en `pending`.
L'intégration réelle avec le **Portail Public de Facturation (PPF)** / Chorus Pro
nécessite les credentials API de Chorus Pro (disponibles sur [piste.gouv.fr](https://piste.gouv.fr)).

## Guinée

Différences vs France :
- Devise : GNF (Franc Guinéen)
- Pas de TVA standard (taux à 0 par défaut, modifiable)
- Pas de Factur-X
- Numérotation séparée : `FAC-GN-XXXX` / `DEV-GN-XXXX`
- Champ NIF au lieu de SIREN
