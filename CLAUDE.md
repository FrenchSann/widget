# AccessAudit — SaaS d'audit d'accessibilité web (RGAA/EAA)

## Objectif du produit

AccessAudit est un SaaS destiné aux PME françaises pour auditer, surveiller et améliorer l'accessibilité de leurs sites web selon les référentiels RGAA (Référentiel Général d'Amélioration de l'Accessibilité) et EAA (European Accessibility Act).

Fonctionnalités principales :
- **Scanner** : analyse automatisée des pages web via Playwright + axe-core
- **Monitoring** : surveillance continue avec alertes en cas de régression
- **Rapports** : génération de rapports PDF/HTML exportables par client

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend / API | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Base de données | Supabase (PostgreSQL) |
| Authentification | Supabase Auth |
| Stockage fichiers | Supabase Storage |
| Paiement | Stripe (abonnements) |
| Scan d'accessibilité | Playwright + axe-core (service worker séparé) |
| Emails transactionnels | Resend |

## Structure des dossiers

```
/
├── app/                    # Routes Next.js App Router
│   ├── (auth)/             # Groupe de routes auth (login, register, reset)
│   ├── (dashboard)/        # Groupe de routes authentifiées
│   │   ├── dashboard/      # Page principale
│   │   ├── projects/       # Gestion des projets
│   │   ├── reports/        # Rapports d'accessibilité
│   │   └── settings/       # Paramètres compte/abonnement
│   ├── api/                # Route handlers API
│   │   ├── scan/           # Endpoints de déclenchement du scan
│   │   ├── stripe/         # Webhooks Stripe
│   │   └── reports/        # Génération et export de rapports
│   ├── layout.tsx          # Layout racine
│   └── page.tsx            # Landing page
├── components/             # Composants React réutilisables
│   ├── ui/                 # Composants UI de base (boutons, inputs, modals)
│   ├── dashboard/          # Composants spécifiques au dashboard
│   └── reports/            # Composants de visualisation des rapports
├── lib/                    # Utilitaires et clients
│   ├── supabase/           # Client Supabase (server + client)
│   ├── stripe/             # Client et helpers Stripe
│   ├── resend/             # Client Resend et templates email
│   └── utils.ts            # Utilitaires généraux
├── worker/                 # Service de scan séparé (futur microservice)
│   ├── scanner.ts          # Logique de scan Playwright + axe-core
│   ├── queue.ts            # Gestion de la file d'attente
│   └── reporters/          # Formatage des résultats
├── types/                  # Types TypeScript globaux
└── public/                 # Assets statiques
```

## Conventions de code

### TypeScript
- Toujours typer explicitement les retours de fonctions et les props
- Préférer `interface` pour les types d'objets, `type` pour les unions/intersections
- Pas de `any` — utiliser `unknown` si le type est vraiment inconnu

### Composants React
- Un composant par fichier, nommé en PascalCase
- Props typées avec une `interface` nommée `<ComponentName>Props`
- Server Components par défaut ; `"use client"` uniquement si nécessaire
- Pas de prop drilling au-delà de 2 niveaux → utiliser Context ou Zustand

### API Routes (App Router)
- Utiliser les Route Handlers (`route.ts`) avec les helpers `NextRequest`/`NextResponse`
- Toujours valider les inputs avec Zod
- Retourner des erreurs structurées `{ error: string, code: string }`

### Styles
- Tailwind CSS uniquement — pas de CSS modules ni styled-components
- Variants via `clsx` + `tailwind-merge`
- Design system : palette définie dans `tailwind.config.ts`

### Nommage des fichiers
- Composants : `PascalCase.tsx`
- Utilitaires / hooks : `camelCase.ts`
- Routes App Router : `page.tsx`, `layout.tsx`, `route.ts` (convention Next.js)

### Git
- Commits en anglais, format conventionnel : `feat:`, `fix:`, `chore:`, `docs:`
- Pas de secrets dans le code — toujours via variables d'environnement

## Schéma de base de données (Supabase)

Projet Supabase : `lgspxbfayltbwvyjurtg` (région : eu-north-1)

### Tables

| Table | Colonnes principales | Description |
|-------|---------------------|-------------|
| `auth.users` | géré par Supabase Auth | Comptes utilisateurs |
| `sites` | id, user_id, url, name, created_at | Sites web à auditer |
| `scans` | id, site_id, status, score, pages_scanned, started_at, finished_at | Runs de scan |
| `issues` | id, scan_id, page_url, severity, wcag_rule, rgaa_theme, selector, description, status | Violations RGAA/WCAG |
| `subscriptions` | id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end | Abonnements Stripe |
| `leads` | id, email, url, score, scan_data (jsonb), created_at | Scans gratuits avant inscription |

### Row Level Security

- **sites / scans / issues** : un utilisateur ne voit et ne modifie que ses propres données (via `auth.uid() = user_id`)
- **subscriptions** : lecture/écriture uniquement par le propriétaire
- **leads** : insert public (anon peut écrire), lecture service_role uniquement

### Authentification

- Magic link uniquement (pas de mot de passe) via `supabase.auth.signInWithOtp()`
- Callback : `GET /auth/callback` → échange le code PKCE → redirige vers `/dashboard`
- Protection : `middleware.ts` redirige `/dashboard` → `/login` si non authentifié

## Variables d'environnement

Voir `.env.example` pour la liste complète. Copier en `.env.local` pour le développement local.

## Lancer le projet en local

```bash
npm install
cp .env.example .env.local
# Remplir les valeurs dans .env.local
npm run dev
```
