"""Configuration de l'assistant ZotoShop, lue depuis l'environnement.

Tout est pilotable par variable d'env pour que l'eleve puisse changer le
comportement (modele, temperature, garde-fous) sans toucher au code.
"""
import os
from pathlib import Path


def _flag(name: str, default: str = "off") -> bool:
    """Un garde-fou est ACTIF quand la variable vaut 'on'. Sinon la faille est ouverte."""
    return os.getenv(name, default).strip().lower() == "on"


# ─── LLM ────────────────────────────────────────────────────────────
# Backend du wrapper ask() : "claude" (Anthropic API) ou "ollama" (local)
ZOTO_LLM = os.getenv("ZOTO_LLM", "claude").strip().lower()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")

# Temperature par defaut de l'assistant. Volontairement haute : nourrit le TP
# hallucination (M6). L'eleve la baissera pour observer l'effet.
DEFAULT_TEMPERATURE = float(os.getenv("ASSISTANT_TEMPERATURE", "0.9"))

# ─── RAG ────────────────────────────────────────────────────────────
KNOWLEDGE_DIR = Path(os.getenv("KNOWLEDGE_DIR", "/app/knowledge"))
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "/data/chroma")
CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION", "zotoshop")
RAG_TOP_K = int(os.getenv("RAG_TOP_K", "4"))

# ─── Medusa (tool get_order_status) ─────────────────────────────────
MEDUSA_BACKEND_URL = os.getenv("MEDUSA_BACKEND_URL", "http://backend:9000")
MEDUSA_PUBLISHABLE_KEY = os.getenv(
    "MEDUSA_PUBLISHABLE_KEY",
    "pk_67ca30d828fcd266b9f6ac6f89e77240603030d4ed5a3220037d84ea1c34e387",
)

# ─── Garde-fous (off = faille volontaire active, pour les TP) ───────
# Quand un flag passe a "on", la contre-mesure correspondante s'applique.
GUARDRAIL_SYSTEM_PROMPT_LEAK = _flag("GUARDRAIL_SYSTEM_PROMPT_LEAK")
GUARDRAIL_INJECTION_FILTER = _flag("GUARDRAIL_INJECTION_FILTER")
GUARDRAIL_RAG_SANITIZE = _flag("GUARDRAIL_RAG_SANITIZE")
GUARDRAIL_GROUNDING_STRICT = _flag("GUARDRAIL_GROUNDING_STRICT")
GUARDRAIL_PII_REDACT = _flag("GUARDRAIL_PII_REDACT")
GUARDRAIL_AUTHZ_ORDER = _flag("GUARDRAIL_AUTHZ_ORDER")


def guardrails_snapshot() -> dict:
    """Etat courant des garde-fous, expose par /api/config (reproductibilite evals)."""
    return {
        "system_prompt_leak": GUARDRAIL_SYSTEM_PROMPT_LEAK,
        "injection_filter": GUARDRAIL_INJECTION_FILTER,
        "rag_sanitize": GUARDRAIL_RAG_SANITIZE,
        "grounding_strict": GUARDRAIL_GROUNDING_STRICT,
        "pii_redact": GUARDRAIL_PII_REDACT,
        "authz_order": GUARDRAIL_AUTHZ_ORDER,
    }
