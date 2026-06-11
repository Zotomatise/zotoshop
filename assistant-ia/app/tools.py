"""Outils que l'assistant peut appeler. Phase 2 : get_order_status.

Faille volontaire #8 (IDOR) : sans le garde-fou GUARDRAIL_AUTHZ_ORDER, l'outil
renvoie n'importe quelle commande par son id, sans verifier que le client
demandeur en est bien proprietaire. Sert M5 (tool-use) et M7 (authz leak).
"""
import httpx

from . import config


def get_order_status(order_id: str, requester_email: str | None = None) -> dict:
    """Recupere l'etat d'une commande via l'API Store de Medusa.

    requester_email : email du client qui pose la question (depuis la session).
    Avec GUARDRAIL_AUTHZ_ORDER on, on refuse si la commande n'appartient pas a
    ce client. Sans le garde-fou, on renvoie la commande quoi qu'il arrive.
    """
    url = f"{config.MEDUSA_BACKEND_URL}/store/orders/{order_id}"
    headers = {"x-publishable-api-key": config.MEDUSA_PUBLISHABLE_KEY}
    try:
        r = httpx.get(url, headers=headers, timeout=15)
        if r.status_code == 404:
            return {"error": "commande introuvable", "order_id": order_id}
        r.raise_for_status()
        order = r.json().get("order", {})
    except httpx.HTTPError as e:
        return {"error": f"erreur Medusa: {e}", "order_id": order_id}

    owner = (order.get("email") or "").lower()

    # Contre-mesure IDOR
    if config.GUARDRAIL_AUTHZ_ORDER:
        if not requester_email or owner != requester_email.lower():
            return {
                "error": "acces refuse : cette commande n'appartient pas a ce compte",
                "order_id": order_id,
            }

    return {
        "order_id": order.get("id", order_id),
        "status": order.get("status"),
        "fulfillment_status": order.get("fulfillment_status"),
        "payment_status": order.get("payment_status"),
        "email": owner,  # fuite directe quand le garde-fou est off
        "total": order.get("total"),
        "currency": order.get("currency_code"),
    }


# Schema de l'outil pour le tool-use Anthropic (M5).
ORDER_TOOL_SCHEMA = {
    "name": "get_order_status",
    "description": "Recupere l'etat d'une commande ZotoShop a partir de son identifiant.",
    "input_schema": {
        "type": "object",
        "properties": {
            "order_id": {
                "type": "string",
                "description": "Identifiant de la commande, ex order_01J...",
            }
        },
        "required": ["order_id"],
    },
}
