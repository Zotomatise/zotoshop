import { test, expect, request } from "@playwright/test"

// Tests de reference du CONTRAT de l'API de l'assistant (cerveau Python).
// Tapent directement le service FastAPI (port 8100), sans navigateur.
const API = process.env.ASSISTANT_API || "http://localhost:8100"

test.describe("ZotoShop Assistant - contrat API", () => {
  test("health repond ok", async () => {
    const ctx = await request.newContext()
    const res = await ctx.get(`${API}/api/health`)
    expect(res.ok()).toBeTruthy()
    expect((await res.json()).status).toBe("ok")
  })

  test("chat renvoie une reponse ancree avec des sources", async () => {
    const ctx = await request.newContext()
    const res = await ctx.post(`${API}/api/chat`, {
      data: { message: "Quelle est la garantie du ZotoBook Air 14 ?" },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body).toHaveProperty("answer")
    expect(body).toHaveProperty("sources")
    expect(Array.isArray(body.sources)).toBeTruthy()
    // Avec une cle, la reponse est ancree sur des sources du corpus.
    // Sans cle (CI / demo), l'assistant renvoie le contrat no_key (BYOK).
    if (!body.no_key) expect(body.sources.length).toBeGreaterThan(0)
  })

  test("search renvoie un retrieval classe par score", async () => {
    const ctx = await request.newContext()
    const res = await ctx.get(`${API}/api/search?q=livraison express delai`)
    const body = await res.json()
    expect(body.results.length).toBeGreaterThan(0)
    // le meilleur resultat doit concerner la livraison
    expect(body.results[0].doc).toContain("livraison")
  })

  test("config expose l'etat des garde-fous", async () => {
    const ctx = await request.newContext()
    const res = await ctx.get(`${API}/api/config`)
    const body = await res.json()
    expect(body).toHaveProperty("guardrails")
    expect(body.guardrails).toHaveProperty("injection_filter")
  })
})
