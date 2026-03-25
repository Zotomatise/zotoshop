# ZotoShop — Guide de Deploiement Gratuit

Stack: **Vercel** (storefront) + **Koyeb** (backend) + **Neon** (PostgreSQL) + **Upstash** (Redis)

---

## Etape 1 — Creer la base de donnees (Neon)

1. Va sur https://neon.tech et cree un compte gratuit
2. Cree un nouveau projet : **zotoshop**
3. Copie la **connection string** (format: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)
4. Garde cette URL, tu en auras besoin pour Koyeb

---

## Etape 2 — Creer le cache Redis (Upstash)

1. Va sur https://upstash.com et cree un compte gratuit
2. Cree une base Redis : **zotoshop-redis**
3. Copie l'**UPSTASH_REDIS_REST_URL** au format `rediss://default:xxx@region.upstash.io:6379`
4. Garde cette URL pour Koyeb

---

## Etape 3 — Push le code sur GitHub

```bash
cd zotoshop
git remote add origin https://github.com/zotomatise/zotoshop.git
git push -u origin main
```

---

## Etape 4 — Deployer le Backend sur Koyeb

1. Va sur https://koyeb.com et cree un compte gratuit (via GitHub)
2. Cree un nouveau service → **Docker**
3. Source : ton repo GitHub `zotomatise/zotoshop`
4. **Build settings** :
   - Dockerfile path : `backend/Dockerfile.prod`
   - Build context : `backend`
5. **Port** : `9000`
6. **Variables d'environnement** :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | `postgresql://...` (URL Neon) |
| `REDIS_URL` | `rediss://...` (URL Upstash) |
| `JWT_SECRET` | `zotoshop-jwt-secret-prod-2026` |
| `COOKIE_SECRET` | `zotoshop-cookie-secret-prod-2026` |
| `NODE_ENV` | `production` |
| `STORE_CORS` | `https://zotoshop.vercel.app` |
| `ADMIN_CORS` | `https://zotoshop-xxx.koyeb.app` |
| `AUTH_CORS` | `https://zotoshop.vercel.app,https://zotoshop-xxx.koyeb.app` |

> Remplace `zotoshop-xxx.koyeb.app` par l'URL que Koyeb te donne, et `zotoshop.vercel.app` par ton URL Vercel finale.

7. Deploy ! Le premier deploiement prend ~5 min (build + migrate + seed)

---

## Etape 5 — Deployer le Storefront sur Vercel

1. Va sur https://vercel.com et connecte ton compte GitHub
2. Importe le repo `zotomatise/zotoshop`
3. **Settings** :
   - Root directory : `storefront`
   - Framework preset : **Next.js** (auto-detecte)
   - Build command : `yarn build`
   - Output directory : `.next`
4. **Variables d'environnement** :

| Variable | Valeur |
|----------|--------|
| `MEDUSA_BACKEND_URL` | `https://zotoshop-xxx.koyeb.app` (URL Koyeb) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_67ca30d828fcd266b9f6ac6f89e77240603030d4ed5a3220037d84ea1c34e387` |
| `NEXT_PUBLIC_BASE_URL` | `https://zotoshop.vercel.app` |
| `NEXT_PUBLIC_DEFAULT_REGION` | `fr` |
| `REVALIDATE_SECRET` | `zotoshop-revalidate-secret` |

5. Deploy !

---

## Etape 6 — Mettre a jour les CORS

Une fois les deux services deployes, mets a jour les CORS sur Koyeb avec les vraies URLs :

- `STORE_CORS` = URL Vercel
- `ADMIN_CORS` = URL Koyeb
- `AUTH_CORS` = URL Vercel + URL Koyeb

---

## URLs finales

| Service | URL |
|---------|-----|
| Storefront | `https://zotoshop.vercel.app` |
| API | `https://zotoshop-xxx.koyeb.app` |
| Admin | `https://zotoshop-xxx.koyeb.app/app` |

---

## Limites du free tier

| Service | Limite |
|---------|--------|
| Vercel | 100GB bandwidth/mois |
| Koyeb | 1 nano service (512MB RAM) |
| Neon | 0.5GB storage, 190h compute/mois |
| Upstash | 10K commandes/jour |

Pour une app de formation QA, c'est largement suffisant.
