# ZotoShop

[![CI](https://github.com/Zotomatise/zotoshop/actions/workflows/ci.yml/badge.svg)](https://github.com/Zotomatise/zotoshop/actions/workflows/ci.yml)

Application e-commerce de test pour la formation **QA Automaticien 2.0** de [Zotomatise Labs](https://zotomatise.com).

## Architecture

```
zotoshop/
  backend/       → API Medusa.js (Node.js/TypeScript) — port 9000
  storefront/    → Frontend Next.js (React) — port 8000
  docker-compose.yml → Lance tout en une commande
```

## Stack technique

| Composant | Technologie | Port |
|-----------|------------|------|
| Frontend | Next.js 14 (React) | `localhost:8000` |
| API Backend | Medusa.js v2 (Node.js/TypeScript) | `localhost:9000` |
| Admin Dashboard | Medusa Admin | `localhost:9000/app` |
| Base de donnees | PostgreSQL 16 | `localhost:5432` |
| Cache | Redis 7 | `localhost:6379` |

## Lancement rapide (Docker)

```bash
# Cloner le projet
git clone https://github.com/zotomatise/zotoshop.git
cd zotoshop

# Lancer tout (premiere fois : ~3-5 min)
docker compose up

# URLs disponibles :
# Storefront  → http://localhost:8000
# API         → http://localhost:9000/store/products
# Admin       → http://localhost:9000/app
```

## Lancement sans Docker (developpement)

### Pre-requis
- Node.js >= 20
- PostgreSQL 16
- Redis 7 (optionnel en dev)

### Backend
```bash
cd backend
cp .env.template .env   # Configurer DATABASE_URL
npm install
npx medusa db:migrate
npx medusa exec ./src/scripts/seed.ts
npx medusa develop
```

### Storefront
```bash
cd storefront
cp .env.template .env
npm install
npm run dev
```

## Catalogue ZotoShop

### 5 categories — 12 produits — 35 variantes

| Categorie | Produits |
|-----------|---------|
| Smartphones | ZotoPhone Pro 15 (699-999 EUR), ZotoPhone Lite (299-379 EUR) |
| Laptops | ZotoBook Air 14 (799-1299 EUR), ZotoBook Pro 16 (1899-2499 EUR) |
| Accessoires | ZotoCoque (19-29 EUR), ZotoCharge 65W (39-59 EUR), Cable ZotoLink (15-24 EUR) |
| Audio | ZotoBuds Pro (129-139 EUR), ZotoSpeaker Boom (89 EUR) |
| Gaming | ZotoPad Controller (69-79 EUR), ZotoScreen 27 (279-349 EUR), ZotoMouse (49-79 EUR) |

## API REST

L'API Medusa expose des endpoints REST documentes :

```bash
# Lister les produits
curl http://localhost:9000/store/products

# Voir un produit
curl http://localhost:9000/store/products/{id}

# Creer un panier
curl -X POST http://localhost:9000/store/carts

# Ajouter au panier
curl -X POST http://localhost:9000/store/carts/{id}/line-items \
  -H "Content-Type: application/json" \
  -d '{"variant_id": "...", "quantity": 1}'
```

Documentation API complete : https://docs.medusajs.com/api/store

## Bugs pedagogiques (pour les exercices)

Cette application contient des bugs **intentionnels** que les eleves doivent trouver et reporter.
Chaque module de la formation debloque de nouveaux defis.

| # | Bug | Page | Module |
|---|-----|------|--------|
| 1 | Calcul panier incorrect quand quantite > 9 | Cart | M0 |
| 2 | Bouton "Ajouter au panier" avec delai 3s | Product | M0 |
| 3 | Classes CSS dynamiques sur les filtres | Catalog | M0 |
| 4 | Email sans @ accepte dans le formulaire | Register | M0 |
| 5 | API /orders retourne 500 aleatoirement | API | M4 |
| 6 | Checkout casse en mobile (<768px) | Checkout | M2 |
| 7 | Recherche vulnerable XSS | Search | M6 |
| 8 | Pagination saute la page 3 | Catalog | M2 |
| 9 | Tri par prix descendant ne marche pas | Catalog | M2 |
| 10 | Webhook paiement non traite (commande pending) | Payment | M5 |

## Utilisation dans la formation

| Module | Usage de ZotoShop |
|--------|-------------------|
| Module 0 | Installation (docker compose up) + premiers tests manuels |
| Module IA M1 | Prompt engineering sur les produits ZotoShop |
| Module IA M2 | Generation de tests E2E avec LLM |
| Module IA M3 | RAG sur la doc API ZotoShop |
| Module IA M4 | CI/CD + tests automatises sur ZotoShop |
| Module IA M5 | Agent IA sprint complet sur ZotoShop |
| Module IA M6 | Docker + monitoring + dashboard |

## Licence

MIT — Zotomatise Labs 2026
