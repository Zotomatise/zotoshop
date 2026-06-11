"""Orchestration de l'assistant ZotoShop : RAG -> prompt -> garde-fous -> ask().

C'est le coeur que l'eleve lit et modifie. Chaque etape est explicite pour
qu'on voie ou la securite est appliquee (ou absente).
"""
import time
from typing import Iterator

from . import config, guardrails, rag
from .llm import ask

BASE_SYSTEM = (
    "Tu es ZotoShop Assistant, le support client de la boutique tech ZotoShop. "
    "Tu reponds en francais, de facon concise et utile, en t'appuyant sur la "
    "documentation produits et les politiques de la boutique. "
    "Tu aides sur les produits, la livraison, les retours et la garantie."
)


def _build_system_prompt() -> str:
    """System prompt + bloc secret (faille #2) + consigne d'ancrage (faille #5)."""
    return BASE_SYSTEM + guardrails.build_secret_block() + guardrails.grounding_instruction()


def _build_context(sources: list[dict]) -> str:
    """Concatene les chunks RAG (sanitises si garde-fou #3 on) en bloc CONTEXTE."""
    parts = []
    for s in sources:
        clean = guardrails.sanitize_rag_chunk(s["text"])
        parts.append(f"[{s['doc']}]\n{clean}")
    return "\n\n---\n\n".join(parts)


def _retrieve(message: str) -> list[dict]:
    return rag.search(message, exclude_sensitive=guardrails.exclude_sensitive())


def _compose_prompt(message: str, context: str) -> str:
    return (
        f"CONTEXTE (documentation ZotoShop) :\n{context}\n\n"
        f"QUESTION DU CLIENT :\n{message}\n\n"
        "Reponds au client."
    )


def answer(message: str, history: list[dict] | None = None) -> dict:
    """Reponse complete (non-stream). Renvoie le contrat /api/chat."""
    t0 = time.time()

    # Garde-fou #1/#6 : filtre d'injection en entree
    message, blocked = guardrails.filter_user_message(message)
    if blocked:
        return {
            "answer": "Je ne peux pas traiter cette demande.",
            "sources": [],
            "usage": {"input_tokens": 0, "output_tokens": 0},
            "latency_ms": int((time.time() - t0) * 1000),
            "model": _current_model(),
            "blocked": True,
        }

    sources = _retrieve(message)
    context = _build_context(sources)
    system = _build_system_prompt()
    prompt = _compose_prompt(message, context)

    result = ask(prompt, system=system, history=history, stream=False)

    # Garde-fou #7 : redaction PII en sortie
    text = guardrails.redact_pii(result.text)

    return {
        "answer": text,
        "sources": [
            {"doc": s["doc"], "chunk": s["chunk"], "score": s["score"], "sensitive": s["sensitive"]}
            for s in sources
        ],
        "usage": {"input_tokens": result.input_tokens, "output_tokens": result.output_tokens},
        "latency_ms": int((time.time() - t0) * 1000),
        "model": _current_model(),
        "blocked": False,
    }


def answer_stream(message: str, history: list[dict] | None = None) -> Iterator[str]:
    """Version streaming (SSE) pour M4. Pas de redaction PII en flux (volontaire)."""
    message, blocked = guardrails.filter_user_message(message)
    if blocked:
        yield "Je ne peux pas traiter cette demande."
        return
    sources = _retrieve(message)
    context = _build_context(sources)
    system = _build_system_prompt()
    prompt = _compose_prompt(message, context)
    for piece in ask(prompt, system=system, history=history, stream=True):
        yield piece


def _current_model() -> str:
    return config.OLLAMA_MODEL if config.ZOTO_LLM == "ollama" else config.ANTHROPIC_MODEL
