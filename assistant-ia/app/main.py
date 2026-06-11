"""API FastAPI de l'assistant ZotoShop.

Endpoints (voir SPEC.md section 4) : chat, chat/stream, search, reindex,
config, health, order. Tous renvoient des contrats stables sur lesquels les
tests Playwright s'appuient.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from . import assistant, config, rag, tools

app = FastAPI(title="ZotoShop Assistant", version="1.0")

# CORS large : terrain de TP local. En prod, restreindre aux domaines ZotoShop.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatBody(BaseModel):
    session_id: str | None = None
    message: str
    history: list[dict] | None = None
    requester_email: str | None = None


@app.get("/api/health")
def health():
    return {"status": "ok", "llm": config.ZOTO_LLM}


@app.get("/api/config")
def get_config():
    return {
        "llm": config.ZOTO_LLM,
        "model": assistant._current_model(),
        "temperature": config.DEFAULT_TEMPERATURE,
        "rag_top_k": config.RAG_TOP_K,
        "guardrails": config.guardrails_snapshot(),
    }


@app.post("/api/chat")
def chat(body: ChatBody):
    return assistant.answer(body.message, history=body.history)


@app.post("/api/chat/stream")
def chat_stream(body: ChatBody):
    def event_stream():
        for piece in assistant.answer_stream(body.message, history=body.history):
            yield f"data: {piece}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/api/search")
def search(q: str, top_k: int = config.RAG_TOP_K):
    """Retrieval brut, sans LLM. Sert M6 (retrieval precision)."""
    results = rag.search(q, top_k=top_k)
    return {"query": q, "results": results}


@app.post("/api/reindex")
def reindex():
    return rag.reindex()


@app.get("/api/order/{order_id}")
def order(order_id: str, requester_email: str | None = None):
    """Tool get_order_status expose en HTTP. Faille IDOR #8 selon le garde-fou."""
    return tools.get_order_status(order_id, requester_email=requester_email)


@app.on_event("startup")
def _startup():
    # Index au demarrage si la collection est vide.
    try:
        rag.reindex()
    except Exception as e:  # ne bloque pas le boot si knowledge/ absent
        print(f"[assistant] reindex au demarrage echoue: {e}")
