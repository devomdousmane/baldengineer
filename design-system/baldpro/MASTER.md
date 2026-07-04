# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/baldpro/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** BaldPro SaaS (`saas/`)
**Generated:** 2026-07-02
**Category:** Financial Dashboard — B2B Professional

---

## Global Rules

### Color Palette

Source de vérité : `saas/app/globals.css` (`:root` + `.dark`). Ne jamais hardcoder un hex dans un composant — toujours passer par les tokens.

| Role | Light | Dark | CSS Variable | Utilitaire Tailwind |
|------|-------|------|--------------|---------------------|
| Background | `#F8FAFC` | `#0D1117` | `--color-bg` | `bg-bg` / `bg-background` |
| Surface / Card | `#FFFFFF` | `#1C2128` | `--color-card` | `bg-card` |
| Primary (navy) | `#0F172A` | `#E2E8F0` | `--color-primary` | `bg-primary` |
| Accent (vert logo) | `#2D8A3E` | `#4DB85C` | `--color-accent` | `bg-accent`, `text-accent` |
| Accent dim | `rgba(45,138,62,.08)` | `rgba(77,184,92,.15)` | `--color-accent-dim` | `bg-accent-dim` |
| Text | `#020617` | `#F0F6FC` | `--color-text` | `text-foreground` |
| Text secondaire | `#475569` | `#8B949E` | `--color-text-2` | `text-muted-foreground` |
| Border | `#E2E8F0` | `rgba(255,255,255,.08)` | `--color-border` | `border-border` |
| Success / Warning / Danger / Info | voir globals.css | idem | `--color-success` … | `text-success`, `bg-danger/10`… |
| France / Guinée | `#1D4ED8` / `#DC2626` | `#60A5FA` / `#F87171` | `--color-fr`, `--color-gn` | `text-fr`, `text-gn` |

**Color Notes:** Navy = confiance/finance, vert BaldEngineer = marque. La **sidebar est navy en permanence** (light et dark) via la classe `.sidebar-surface`, qui re-scope tous les tokens — un composant rendu dedans s'adapte automatiquement.

### Typography

- **Heading Font:** Space Grotesk (`--font-heading`, utilitaire `font-heading`)
- **Body Font:** Inter (`--font-sans`)
- **Mono (montants, tabular):** JetBrains Mono (`--font-mono`) + `tabular-nums`
- **Mood:** professionnel, précis, dense mais lisible

Chargées via `next/font` dans `app/layout.tsx` — ne pas ajouter d'`@import` de fonts.

### Spacing & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `6px` | Badges, petits contrôles |
| `--radius-md` | `8px` | Boutons, inputs (`rounded-md`) |
| `--radius-lg` | `12px` | Cartes (`rounded-lg`) |
| `--radius-xl` | `16px` | Modales, panneaux (`rounded-xl`) |

Espacements : échelle Tailwind standard. Padding de carte : `p-4 sm:p-5`.

### Shadow Depths

| Level | Usage | Utilitaire |
|-------|-------|-----------|
| `--shadow-xs` → `--shadow-xl` | Élévation classique | `shadow-xs` … `shadow-xl` |
| `--shadow-glow` | Hover CTA vert, logo, éléments premium | `shadow-glow` |
| `--shadow-glow-primary` | Éléments navy mis en avant | `shadow-glow-primary` |

Les glows sont dérivés de l'accent via `color-mix` — ils s'adaptent au dark mode.

### Motion

- **Easing signature :** `cubic-bezier(0.22, 1, 0.36, 1)` (`ease-smooth`, `--ease-out`)
- **Durées :** 150ms (hover) / 250ms (transitions) / 400ms (entrées de page)
- **Animations disponibles :** `animate-fade-in`, `animate-slide-up`, `animate-slide-in`, `animate-pulse-soft`, `animate-shimmer`
- Entrées de listes : framer-motion avec stagger 0.04–0.07s
- `prefers-reduced-motion` respecté globalement (globals.css + `MotionConfig reducedMotion="user"`)

---

## Component Specs

Composants existants dans `saas/components/ui/` — **toujours les réutiliser**, ne pas recréer :

| Composant | Fichier | Notes |
|-----------|---------|-------|
| Button | `button.tsx` | variants `primary` (vert + glow au hover), `secondary`, `ghost`, `danger`, `outline`, `success`, `link` |
| Card / KpiCard | `card.tsx` | KpiCard : compteur animé, sparkline, barre d'accent |
| Badge | `badge.tsx` | variants sémantiques + `france` / `guinee` |
| Input / Select / Textarea | `input.tsx` | label + error + hint intégrés |
| DataTable | `data-table.tsx` | tables des listes |
| Tooltip / LabelWithTooltip | `tooltip.tsx` | aide contextuelle (champs Factur-X, etc.) |
| ConfirmModal | `confirm-modal.tsx` | confirmations destructives — ne jamais utiliser `window.confirm` |
| PageLoader | `page-loader.tsx` | loader plein écran de marque |
| Skeleton | `skeleton.tsx` | états de chargement (shimmer) |

### Patterns

- **Montants** : toujours `tabular-nums`, format `fr-FR`, devise selon le marché (EUR / GNF).
- **Sidebar** : classe `.sidebar-surface` obligatoire sur `<aside>` — actifs en vert accent, jamais de surface claire.
- **Empty states** : `.bg-mesh` + icône + CTA.
- **Hero/login** : `.bg-mesh` en fond, titres avec `.text-gradient` (navy → vert).

---

## Style Guidelines

**Style:** Financial Dashboard, premium sobre

**Keywords:** densité maîtrisée, tabular-nums, élévations douces, glow accent discret, navy + vert, micro-interactions fluides

**Best For:** gestion devis/factures, comptabilité, KPIs

### Page Pattern

- **Layout :** sidebar navy fixe (240px) + header sticky 56px + contenu max 1200px
- **Pages liste :** Header (titre + AddButton) > filtres > DataTable
- **Pages détail :** Header (titre + actions) > carte(s) de contenu
- **Dashboard :** KpiCards (grid 4) > graphique revenus > factures récentes

---

## Anti-Patterns (Do NOT Use)

- ❌ Hex hardcodé dans un composant (toujours des tokens)
- ❌ `window.confirm` / `alert` (utiliser ConfirmModal)
- ❌ **Emojis as icons** — Lucide uniquement (exception : drapeaux 🇫🇷 🇬🇳 des marchés)
- ❌ **Missing cursor:pointer** sur les éléments cliquables
- ❌ **Layout-shifting hovers** (pas de scale qui décale la mise en page)
- ❌ **Low contrast text** — 4.5:1 minimum (`--color-text-3` = décoratif uniquement)
- ❌ **Instant state changes** — transitions 150–300ms obligatoires
- ❌ **Invisible focus states** — le focus ring accent global doit rester visible
- ❌ Animations rapides/brusques (pas de durée < 150ms hors micro-feedback)

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] Tokens utilisés partout (aucun hex en dur)
- [ ] Fonctionne en light **et** dark mode (tester les deux)
- [ ] Icônes Lucide cohérentes (`w-4 h-4`, strokeWidth 1.75–2)
- [ ] `cursor-pointer` sur tout élément cliquable
- [ ] Hover/focus avec transitions douces (`ease-smooth`)
- [ ] Montants en `tabular-nums` format fr-FR
- [ ] Focus visible au clavier
- [ ] `prefers-reduced-motion` respecté (framer-motion : rester sous MotionConfig)
- [ ] Responsive : 375px, 768px, 1024px, 1440px
- [ ] Libellés en français
