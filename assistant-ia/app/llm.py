"""Le wrapper ask() : un seul point d'appel LLM, deux backends.

C'est l'objet central enseigne des M1.L3. ZOTO_LLM=claude -> Anthropic API.
ZOTO_LLM=ollama -> modele local. L'assistant l'utilise tel quel.
"""
import contextvars
from typing import Iterator

import httpx

from . import config

# Cle API "par requete" (Bring Your Own Key) : posee depuis la requete du client
# (widget) au debut de chaque appel. Repli sur la cle d'environnement.
_api_key_var: contextvars.ContextVar[str | None] = contextvars.ContextVar("api_key", default=None)


def set_request_api_key(key: str | None):
    _api_key_var.set(key or None)


def effective_api_key() -> str:
    return _api_key_var.get() or config.ANTHROPIC_API_KEY


def has_usable_key() -> bool:
    return config.ZOTO_LLM == "ollama" or bool(effective_api_key())


class AskResult:
    """Resultat d'un appel ask() non-stream : texte + comptage de tokens."""

    def __init__(self, text: str, input_tokens: int = 0, output_tokens: int = 0):
        self.text = text
        self.input_tokens = input_tokens
        self.output_tokens = output_tokens


def ask(
    prompt: str,
    system: str | None = None,
    history: list[dict] | None = None,
    temperature: float | None = None,
    stream: bool = False,
    max_tokens: int = 1024,
) -> AskResult | Iterator[str]:
    """Appel LLM unique.

    prompt      : message utilisateur courant
    system      : system prompt (instructions de l'assistant)
    history     : [{"role": "user"|"assistant", "content": "..."}]
    temperature : 0.0 = factuel, 1.0 = creatif (defaut config)
    stream      : True -> generateur de tokens, False -> AskResult
    """
    temperature = config.DEFAULT_TEMPERATURE if temperature is None else temperature
    messages = list(history or [])
    messages.append({"role": "user", "content": prompt})

    if config.ZOTO_LLM == "ollama":
        return _ask_ollama(messages, system, temperature, stream)
    return _ask_claude(messages, system, temperature, stream, max_tokens)


# ─── Backend Claude (Anthropic) ─────────────────────────────────────
def _ask_claude(messages, system, temperature, stream, max_tokens):
    from anthropic import Anthropic

    client = Anthropic(api_key=effective_api_key())
    kwargs = dict(
        model=config.ANTHROPIC_MODEL,
        max_tokens=max_tokens,
        temperature=temperature,
        messages=messages,
    )
    if system:
        kwargs["system"] = system

    if stream:
        def _gen():
            with client.messages.stream(**kwargs) as s:
                for text in s.text_stream:
                    yield text
        return _gen()

    resp = client.messages.create(**kwargs)
    text = "".join(block.text for block in resp.content if block.type == "text")
    return AskResult(text, resp.usage.input_tokens, resp.usage.output_tokens)


# ─── Backend Ollama (local) ─────────────────────────────────────────
def _ask_ollama(messages, system, temperature, stream):
    payload_messages = []
    if system:
        payload_messages.append({"role": "system", "content": system})
    payload_messages.extend(messages)

    url = f"{config.OLLAMA_BASE_URL}/api/chat"
    body = {
        "model": config.OLLAMA_MODEL,
        "messages": payload_messages,
        "options": {"temperature": temperature},
        "stream": stream,
    }

    if stream:
        def _gen():
            import json
            with httpx.stream("POST", url, json=body, timeout=120) as r:
                for line in r.iter_lines():
                    if not line:
                        continue
                    chunk = json.loads(line)
                    piece = chunk.get("message", {}).get("content", "")
                    if piece:
                        yield piece
        return _gen()

    r = httpx.post(url, json=body, timeout=120)
    r.raise_for_status()
    data = r.json()
    text = data.get("message", {}).get("content", "")
    return AskResult(
        text,
        data.get("prompt_eval_count", 0),
        data.get("eval_count", 0),
    )
