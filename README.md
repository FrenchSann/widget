# AccessAudit

SaaS d'audit d'accessibilité web (RGAA/EAA) pour les PME françaises.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — Base de données, Auth, Storage
- **Stripe** — Gestion des abonnements
- **Playwright + axe-core** — Scanner d'accessibilité
- **Resend** — Emails transactionnels

---

## Setup local

### Prérequis

- Node.js >= 18
- npm >= 9

### 1. Cloner et installer les dépendances

```bash
git clone <repo-url>
cd accessaudit
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplir les valeurs dans `.env.local` :

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase (côté serveur uniquement) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe |
| `RESEND_API_KEY` | Clé API Resend |
| `RESEND_FROM_EMAIL` | Email expéditeur vérifié dans Resend |

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## Scripts disponibles

```bash
npm run dev       # Serveur de développement avec hot-reload
npm run build     # Build de production
npm run start     # Serveur de production (après build)
npm run lint      # ESLint
npm run format    # Prettier (format tous les fichiers)
```

---

## Structure du projet

```
/app          → Routes Next.js (App Router)
/components   → Composants React réutilisables
/lib          → Clients Supabase, Stripe, Resend + utilitaires
/worker       → Service de scan (futur microservice Playwright + axe-core)
/types        → Types TypeScript globaux
/public       → Assets statiques
```

Voir [CLAUDE.md](./CLAUDE.md) pour la documentation complète du projet.

---

## Services externes requis

- [Supabase](https://supabase.com) — créer un projet gratuit
- [Stripe](https://stripe.com) — compte en mode test suffit pour le dev
- [Resend](https://resend.com) — compte gratuit (100 emails/jour)
