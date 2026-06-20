# AccessAudit Worker

Service Node.js séparé qui tourne en parallèle de l'app Next.js.

Il fait deux choses :
1. **HTTP endpoint** `/health` + `/scan` — utilisé par Vercel pour les scans page unique (free tier)
2. **Poll loop** — vérifie la table `scan_jobs` toutes les 5 secondes et exécute les crawls multi-pages

## Variables d'environnement requises

| Variable | Exemple | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` ou `SUPABASE_URL` | `https://xxxx.supabase.co` | URL du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Clé service_role (bypasse RLS) — dans Supabase > Settings > API |
| `WORKER_SECRET_KEY` | `un-secret-long` | Token Bearer pour l'endpoint `/scan` |
| `PORT` | `3002` | Port d'écoute (Railway le définit automatiquement) |

## Déploiement sur Railway

### Première fois

1. Créer un nouveau service dans Railway (dans le même projet)
2. Connecter le repo GitHub
3. Railway détecte `railway.toml` → utilise `Dockerfile.worker`
4. Ajouter les variables d'environnement dans Railway > Variables :
   - `SUPABASE_URL` = URL Supabase (sans le préfixe NEXT_PUBLIC)
   - `SUPABASE_SERVICE_ROLE_KEY` = clé service_role
   - `WORKER_SECRET_KEY` = même valeur que dans Vercel
5. Deploy

### Vérification

```bash
# Health check
curl https://your-worker.up.railway.app/health
# → {"ok":true,"service":"accessaudit-scanner"}

# Test scan page unique
curl -X POST https://your-worker.up.railway.app/scan \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

Les logs Railway doivent montrer :
```
AccessAudit worker service listening on port XXXX
[queue] Poll loop started — interval: 5s
```

## Développement local

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Worker (scan page unique + poll loop)
npm run scanner
# ou
npx tsx worker/server.ts
```

Pour tester un job de crawl en local, insérer une ligne dans `scan_jobs` via le dashboard Supabase :
```sql
INSERT INTO scan_jobs (site_id, type, status, pages_limit)
VALUES ('uuid-d-un-site', 'crawl', 'queued', 5);
```

## Architecture

```
Next.js (Vercel)          Worker (Railway)
       │                        │
POST /api/sites/[id]/scan       │
       │ → INSERT scan_jobs     │
       │                        │
       │              poll every 5s
       │                        │
GET /api/scan-jobs/[id]   ← UPDATE scan_jobs + scans + issues
       │ (UI polls)             │
```
