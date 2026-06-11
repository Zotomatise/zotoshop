# ZotoShop Assistant

Feature IA greffee sur ZotoShop : un assistant de support (chatbot + RAG sur la
doc produits) qui sert de **cible de test** pour le cours "Automatisation IA".

Cerveau IA en **Python** (FastAPI). Tests en **Playwright TypeScript**. Failles
IA volontaires et desactivables pour les TP sécurité.

Spec complete : [SPEC.md](SPEC.md).

## Architecture

```
storefront Next.js (8000) ──/api/assistant (proxy)──> assistant-ia FastAPI (8100)
                                                         ├─ ask() (Claude | Ollama)
                                                         ├─ RAG ChromaDB (knowledge/)
                                                         ├─ tools (get_order_status -> Medusa)
                                                         └─ guardrails (flags on/off)
```

## Lancer en local

Depuis la racine `zotoshop/` (le service est un 5e conteneur du compose) :

```bash
cp assistant-ia/.env.example .env      # renseigner ANTHROPIC_API_KEY
docker compose up -d                    # lance tout, dont assistant-ia
```

- Storefront + widget : http://localhost:8000
- API assistant : http://localhost:8100/api/health
- Sans GPU/cle : mettre `ZOTO_LLM=ollama` (Ollama doit tourner sur l'hote).

## Endpoints

| Methode | Route | Role |
|---|---|---|
| POST | `/api/chat` | Chat principal (renvoie answer + sources + usage) |
| POST | `/api/chat/stream` | Chat en streaming SSE |
| GET | `/api/search?q=` | Retrieval brut ChromaDB (sans LLM) |
| POST | `/api/reindex` | Reconstruit l'index depuis `knowledge/` |
| GET | `/api/config` | Modele, temperature, etat des garde-fous |
| GET | `/api/health` | Liveness |
| GET | `/api/order/{id}` | Etat commande (tool, faille IDOR selon garde-fou) |

## Les failles volontaires

Chaque faille est pilotee par un flag dans `.env` (off = faille active). En TP,
l'eleve ecrit le test qui prouve la faille (rouge), passe le flag a `on`, et le
test passe (vert).

| Flag | Faille corrigee | Module |
|---|---|---|
| `GUARDRAIL_INJECTION_FILTER` | Injection directe + jailbreak | M7.L1 |
| `GUARDRAIL_SYSTEM_PROMPT_LEAK` | Extraction du system prompt (secret planque) | M7.L1 |
| `GUARDRAIL_RAG_SANITIZE` | Injection indirecte + data leakage doc sensible | M7.L1/L3 |
| `GUARDRAIL_GROUNDING_STRICT` | Hallucination non ancree | M6.L2 |
| `GUARDRAIL_PII_REDACT` | Fuite de PII en clair | M7.L4 |
| `GUARDRAIL_AUTHZ_ORDER` | IDOR sur l'etat de commande | M5 / M7 |

## Serveur MCP (M5)

```bash
python -m app.mcp_server      # transport stdio, expose search_docs + get_order_status
```

## Tests de reference

```bash
cd tests
npm install && npx playwright install chromium
ASSISTANT_API=http://localhost:8100 STOREFRONT=http://localhost:8000 npm test
```

- `assistant.api.spec.ts` : contrat de l'API
- `assistant.e2e.spec.ts` : widget dans le storefront
- `assistant.secu.spec.ts` : point de depart des TP securite (M7)
