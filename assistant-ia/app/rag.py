"""RAG sur la doc ZotoShop avec ChromaDB.

Indexe knowledge/*.md (decoupe en chunks) dans une collection ChromaDB,
puis recupere les passages pertinents pour une question. Sert M3 (RAG) et
M6 (RAG testing : retrieval precision).

Faille volontaire #4 (data leakage) : knowledge/_interne/marges.md est indexe
dans la MEME collection. Le garde-fou GUARDRAIL_RAG_SANITIZE (cote assistant)
decide si on l'exclut au retrieval.
"""
from pathlib import Path

import chromadb

from . import config

_client = None
_collection = None


def _get_collection():
    global _client, _collection
    if _collection is None:
        _client = chromadb.PersistentClient(path=config.CHROMA_PERSIST_DIR)
        _collection = _client.get_or_create_collection(config.CHROMA_COLLECTION)
    return _collection


def _chunk(text: str, size: int = 800, overlap: int = 100) -> list[str]:
    """Decoupe naive par paragraphes regroupes jusqu'a ~size caracteres."""
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks, current = [], ""
    for p in paras:
        if len(current) + len(p) + 2 > size and current:
            chunks.append(current.strip())
            current = current[-overlap:] if overlap else ""
        current += p + "\n\n"
    if current.strip():
        chunks.append(current.strip())
    return chunks


def reindex() -> dict:
    """Reconstruit l'index depuis knowledge/. Renvoie le compte de docs/chunks."""
    global _collection
    if _client is None:
        _get_collection()
    # repart d'une collection vierge
    _client.delete_collection(config.CHROMA_COLLECTION)
    _collection = _client.get_or_create_collection(config.CHROMA_COLLECTION)

    ids, docs, metas = [], [], []
    files = sorted(config.KNOWLEDGE_DIR.rglob("*.md"))
    for f in files:
        rel = f.relative_to(config.KNOWLEDGE_DIR).as_posix()
        sensitive = rel.startswith("_interne/")
        text = f.read_text(encoding="utf-8")
        for i, ch in enumerate(_chunk(text)):
            ids.append(f"{rel}::{i}")
            docs.append(ch)
            metas.append({"doc": rel, "chunk": i, "sensitive": sensitive})

    if ids:
        _collection.add(ids=ids, documents=docs, metadatas=metas)
    return {"files": len(files), "chunks": len(ids)}


def search(query: str, top_k: int | None = None, exclude_sensitive: bool = False) -> list[dict]:
    """Recupere les top_k passages. Renvoie [{doc, chunk, score, text, sensitive}].

    exclude_sensitive=True applique la contre-mesure du garde-fou RAG_SANITIZE :
    les docs _interne/ sont filtres avant d'arriver au LLM.
    """
    top_k = top_k or config.RAG_TOP_K
    col = _get_collection()
    if col.count() == 0:
        reindex()
    where = {"sensitive": False} if exclude_sensitive else None
    res = col.query(query_texts=[query], n_results=top_k, where=where)

    out = []
    for doc, meta, dist in zip(
        res["documents"][0], res["metadatas"][0], res["distances"][0]
    ):
        out.append({
            "doc": meta["doc"],
            "chunk": meta["chunk"],
            "sensitive": meta.get("sensitive", False),
            "score": round(1 - dist, 4),  # similarite ~ 1 - distance
            "text": doc,
        })
    return out
