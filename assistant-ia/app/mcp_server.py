"""Serveur MCP exposant ZotoShop comme outils pour un agent (M5).

Lance separement : `python -m app.mcp_server` (transport stdio).
Expose deux outils : recherche dans la doc (RAG) et etat de commande.
Volontairement, get_order_status herite de la faille IDOR (#8) tant que le
garde-fou est off : sert M7.L3 (injection indirecte + supply chain MCP).
"""
import anyio
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

from . import rag, tools

server = Server("zotoshop-assistant")


@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="search_docs",
            description="Recherche dans la documentation produits/politiques de ZotoShop.",
            inputSchema={
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        ),
        Tool(
            name="get_order_status",
            description="Etat d'une commande ZotoShop par identifiant.",
            inputSchema=tools.ORDER_TOOL_SCHEMA["input_schema"],
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "search_docs":
        results = rag.search(arguments["query"])
        lines = [f"[{r['doc']}] (score {r['score']})\n{r['text']}" for r in results]
        return [TextContent(type="text", text="\n\n".join(lines))]
    if name == "get_order_status":
        data = tools.get_order_status(arguments["order_id"])
        return [TextContent(type="text", text=str(data))]
    return [TextContent(type="text", text=f"outil inconnu: {name}")]


async def _main():
    async with stdio_server() as (read, write):
        await server.run(read, write, server.create_initialization_options())


if __name__ == "__main__":
    anyio.run(_main)
