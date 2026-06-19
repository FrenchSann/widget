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

## Variables d'environnement

Voir `.env.example` pour la liste complète. Copier en `.env.local` pour le développement local.

## Lancer le projet en local

```bash
npm install
cp .env.example .env.local
# Remplir les valeurs dans .env.local
npm run dev
```
