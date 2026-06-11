"use client"

/**
 * 🧪 Page LIVE PRODUCTS — Client Component dédié pour le Module 6 (Mocking).
 *
 * Contrairement à /fr/store qui est en Server Components (fetch côté Node.js),
 * cette page fait son fetch CÔTÉ BROWSER. Donc `page.route()` peut l'intercepter
 * en tests Playwright.
 *
 * Cas d'usage réel : page de "search live" / "products live" qui se rafraîchit
 * sans reload (panier, autocomplete, dashboard).
 */

import { useEffect, useState } from "react"

type Product = {
  id: string
  title: string
  handle: string
  variants?: unknown[]
}

type ApiResponse = {
  products: Product[]
  count: number
  offset?: number
  limit?: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.zotomatise.com"
const API_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  "pk_0ab41d879415264941a92a80aceb00b1b03b93128c7bfaa08f06ae56eda41233"

export default function ProductsLivePage() {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "ok"; data: ApiResponse }
    | { kind: "empty" }
    | { kind: "rate-limit"; retryAfter: string }
    | { kind: "error"; status: number; message: string }
    | { kind: "network-error"; message: string }
  >({ kind: "loading" })

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/store/products?limit=12`, {
          headers: { "x-publishable-api-key": API_KEY },
          cache: "no-store",  // ⚡ force un appel complet (évite les 304 sans body)
        })

        // Rate limit
        if (response.status === 429) {
          const retry = response.headers.get("retry-after") ?? "?"
          setState({ kind: "rate-limit", retryAfter: retry })
          return
        }

        // Server error
        if (response.status >= 500) {
          setState({
            kind: "error",
            status: response.status,
            message: "Erreur serveur — réessayez plus tard.",
          })
          return
        }

        // Autres erreurs
        if (!response.ok) {
          setState({
            kind: "error",
            status: response.status,
            message: `Erreur (${response.status})`,
          })
          return
        }

        const data: ApiResponse = await response.json()

        if (data.count === 0 || !data.products || data.products.length === 0) {
          setState({ kind: "empty" })
          return
        }

        setState({ kind: "ok", data })
      } catch (err) {
        setState({
          kind: "network-error",
          message: err instanceof Error ? err.message : "Erreur réseau inconnue",
        })
      }
    }

    load()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2" data-testid="page-title">
        Boutique LIVE
      </h1>
      <p className="text-sm text-ui-fg-subtle mb-6">
        Page Client-Side — démonstration pour le Module 6 (Mocking)
      </p>

      {state.kind === "loading" && (
        <div data-testid="loading">Chargement…</div>
      )}

      {state.kind === "empty" && (
        <div
          className="p-8 text-center bg-ui-bg-subtle rounded"
          data-testid="empty-message"
        >
          Aucun produit pour le moment.
        </div>
      )}

      {state.kind === "rate-limit" && (
        <div
          className="p-8 text-center bg-orange-50 border border-orange-300 rounded"
          data-testid="rate-limit-message"
        >
          Trop de requêtes — réessayez dans{" "}
          <strong>{state.retryAfter} secondes</strong>.
        </div>
      )}

      {state.kind === "error" && (
        <div
          className="p-8 text-center bg-red-50 border border-red-300 rounded"
          data-testid="error-message"
        >
          {state.message}
        </div>
      )}

      {state.kind === "network-error" && (
        <div
          className="p-8 text-center bg-red-50 border border-red-300 rounded"
          data-testid="network-error"
        >
          Erreur réseau : {state.message}
        </div>
      )}

      {state.kind === "ok" && (
        <>
          <div className="text-sm mb-4" data-testid="products-count">
            {state.data.count} produit(s) — affichage des{" "}
            {state.data.products.length} premier(s)
          </div>
          <ul
            className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-6"
            data-testid="products-list"
          >
            {state.data.products.map((p) => (
              <li
                key={p.id}
                className="border border-ui-border-base rounded p-4"
                data-testid="product-wrapper"
              >
                <div className="font-semibold" data-testid="product-title">
                  {p.title}
                </div>
                <div
                  className="text-xs text-ui-fg-subtle font-mono mt-1"
                  data-testid="product-handle"
                >
                  {p.handle}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
