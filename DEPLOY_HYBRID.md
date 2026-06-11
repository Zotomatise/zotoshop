# ZotoShop — Déploiement hybride (Vercel + VPS)

> Décidé 2026-06-11. Vitrine sur Vercel (domaine custom), backend + DB + Redis +
> assistant sur le VPS Hostinger. Domaine : **zotoshop.zotomatise.com**.

## Carte

```
Navigateur
   │
   ├── https://zotoshop.zotomatise.com ───────► Vercel (vitrine Next.js)
   │                                              │ appels API
   │                                              ▼
   ├── https://api.zotoshop.zotomatise.com ───► VPS : Medusa backend (:9000)
   │                                              ├── Postgres
   │                                              └── Redis
   └── https://assistant.zotoshop.zotomatise.com ► VPS : assistant FastAPI (:8100)
```

Le VPS ne porte PAS la vitrine (build lourd déporté sur Vercel). Modèle qui scale :
frontends sur Vercel, backends/bases sur le VPS.

## DNS à créer (Namecheap, par Fodé)

| Host | Type | Valeur |
|---|---|---|
| `zotoshop` | CNAME | `cname.vercel-dns.com` (valeur exacte donnée par Vercel à l'ajout du domaine) |
| `api.zotoshop` | A | `187.124.74.170` |
| `assistant.zotoshop` | A | `187.124.74.170` |

## Partie VPS (backend + db + redis + assistant)

Compose de prod SANS le service storefront (voir `docker-compose.prod.yml` à créer).
Services : postgres, redis, backend (`backend/Dockerfile.prod`), assistant-ia.

Variables backend Medusa :
- `DATABASE_URL` = postgres interne
- `REDIS_URL` = redis interne
- `STORE_CORS` = `https://zotoshop.zotomatise.com`
- `ADMIN_CORS` = `https://api.zotoshop.zotomatise.com`
- `AUTH_CORS` = `https://zotoshop.zotomatise.com,https://api.zotoshop.zotomatise.com`
- `JWT_SECRET`, `COOKIE_SECRET` forts, `NODE_ENV=production`

Assistant : `ANTHROPIC_API_KEY` + flags `GUARDRAIL_*` dans le `.env` VPS.

Caddy (`/etc/caddy/Caddyfile`), 2 blocs :
```
api.zotoshop.zotomatise.com { reverse_proxy localhost:9000 }
assistant.zotoshop.zotomatise.com { reverse_proxy localhost:8100 }
```

Déploiement : `/opt/zotoshop`, `docker compose -f docker-compose.prod.yml up -d --build`,
puis migrations Medusa + seed (catalogue 12 produits).

## Partie Vercel (vitrine)

1. Importer `Zotomatise/zotoshop` (compte Vercel Zotomatise).
2. Root directory : `storefront`. Framework : Next.js (auto).
3. Variables d'environnement :

| Variable | Valeur |
|---|---|
| `MEDUSA_BACKEND_URL` | `https://api.zotoshop.zotomatise.com` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_67ca30d828fcd266b9f6ac6f89e77240603030d4ed5a3220037d84ea1c34e387` |
| `NEXT_PUBLIC_BASE_URL` | `https://zotoshop.zotomatise.com` |
| `NEXT_PUBLIC_DEFAULT_REGION` | `fr` |
| `ASSISTANT_URL` | `https://assistant.zotoshop.zotomatise.com` |
| `REVALIDATE_SECRET` | (secret) |

4. Ajouter le domaine custom `zotoshop.zotomatise.com` dans Settings > Domains.

## À corriger avant le 1er build Vercel

- ⚠️ Le storefront a `yarn.lock` ET un `package-lock.json` (stray) : Vercel ne saura
  pas quel gestionnaire utiliser. Garder `yarn.lock`, supprimer `package-lock.json`.

## Qui fait quoi

| Étape | Qui | Bloquant |
|---|---|---|
| Créer les 3 records DNS | Fodé (Namecheap) | oui |
| `vercel login` / import repo + domaine | Fodé (navigateur) | oui |
| Autoriser SSH VPS | Fodé | oui |
| Code, compose prod, Caddy, env, push repo | Claude | non (une fois SSH ok) |
