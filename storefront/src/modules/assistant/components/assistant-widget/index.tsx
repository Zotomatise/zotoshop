"use client"

// ZotoShop Assistant — widget de chat (charte Zotomatise).
// Bulle flottante + panneau. Appelle /api/assistant (proxy -> service Python).
// data-testid poses pour les tests Playwright.
import { useEffect, useRef, useState } from "react"

type Source = { doc: string; chunk: number; score: number; sensitive: boolean }
type Msg = { role: "user" | "bot"; text: string; sources?: Source[] }

const COLORS = {
  bg: "#030308",
  panel: "#0a0a14",
  border: "#1e2030",
  cyan: "#22D3EE",
  gold: "#FFD700",
  text: "#e8e8f0",
  muted: "#8a8aa0",
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Bonjour, je suis ZotoShop Assistant. Une question sur nos produits, la livraison ou les retours ?" },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  // Bring Your Own Key : la clé reste dans le navigateur (localStorage), jamais sur le serveur.
  useEffect(() => {
    const k = typeof window !== "undefined" ? localStorage.getItem("zoto_assistant_key") : null
    if (k) setApiKey(k)
  }, [])

  const saveKey = (k: string) => {
    setApiKey(k)
    if (typeof window !== "undefined") {
      if (k) localStorage.setItem("zoto_assistant_key", k)
      else localStorage.removeItem("zoto_assistant_key")
    }
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const history = messages
      .filter((m) => m.role === "user" || m.role === "bot")
      .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }))
    setMessages((m) => [...m, { role: "user", text }])
    setInput("")
    setLoading(true)
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, api_key: apiKey || undefined }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: "bot", text: data.answer, sources: data.sources }])
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Erreur de connexion a l'assistant." }])
    } finally {
      setLoading(false)
      setTimeout(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight), 50)
    }
  }

  if (!open) {
    return (
      <button
        data-testid="assistant-bubble"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir l'assistant ZotoShop"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 1000,
          width: 60, height: 60, borderRadius: "50%", border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${COLORS.cyan}, #0099FF)`,
          color: COLORS.bg, fontSize: 26, fontWeight: 700,
          boxShadow: "0 6px 24px rgba(34,211,238,0.4)",
        }}
      >
        ✦
      </button>
    )
  }

  return (
    <div
      data-testid="assistant-panel"
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 1000,
        width: 360, maxWidth: "90vw", height: 520, maxHeight: "80vh",
        display: "flex", flexDirection: "column",
        background: COLORS.bg, border: `1px solid ${COLORS.border}`,
        borderRadius: 16, overflow: "hidden", color: COLORS.text,
        fontFamily: "Inter, system-ui, sans-serif",
        boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
      }}
    >
      {/* En-tete */}
      <div style={{
        padding: "14px 16px", display: "flex", justifyContent: "space-between",
        alignItems: "center", borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.panel,
      }}>
        <span style={{ fontWeight: 700, letterSpacing: 0.5, color: COLORS.cyan }}>
          ZotoShop Assistant
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            data-testid="assistant-settings"
            onClick={() => setShowKey((v) => !v)}
            aria-label="Ma cle IA"
            title="Ma cle IA"
            style={{ background: "none", border: "none", color: apiKey ? COLORS.cyan : COLORS.gold, cursor: "pointer", fontSize: 16 }}
          >
            ⚙
          </button>
          <button
            data-testid="assistant-close"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 20 }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Panneau cle IA (BYOK) */}
      {showKey && (
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.panel }}>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>
            Ta clé Anthropic (reste dans ton navigateur, jamais envoyée au serveur).
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              data-testid="assistant-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => saveKey(e.target.value)}
              placeholder="sk-ant-..."
              autoComplete="off"
              style={{ flex: 1, padding: "7px 10px", borderRadius: 8, fontSize: 13, background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, outline: "none" }}
            />
            <button
              data-testid="assistant-key-clear"
              onClick={() => saveKey("")}
              style={{ padding: "0 10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.muted, cursor: "pointer", fontSize: 12 }}
            >
              Effacer
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} data-testid={m.role === "user" ? "assistant-message-user" : "assistant-message-bot"}>
            <div style={{
              maxWidth: "85%",
              marginLeft: m.role === "user" ? "auto" : 0,
              padding: "8px 12px", borderRadius: 12, fontSize: 14, lineHeight: 1.45,
              background: m.role === "user" ? COLORS.cyan : COLORS.panel,
              color: m.role === "user" ? COLORS.bg : COLORS.text,
              border: m.role === "user" ? "none" : `1px solid ${COLORS.border}`,
              whiteSpace: "pre-wrap",
            }}>
              {m.text}
            </div>
            {m.sources && m.sources.length > 0 && (
              <div data-testid="assistant-sources" style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
                Sources : {m.sources.map((s) => s.doc).join(", ")}
              </div>
            )}
          </div>
        ))}
        {loading && <div style={{ fontSize: 13, color: COLORS.muted }}>…</div>}
      </div>

      {/* Saisie */}
      <div style={{ padding: 12, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 8, background: COLORS.panel }}>
        <input
          data-testid="assistant-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Votre question…"
          style={{
            flex: 1, padding: "9px 12px", borderRadius: 10, fontSize: 14,
            background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text,
            outline: "none", fontFamily: "Inter, system-ui, sans-serif",
          }}
        />
        <button
          data-testid="assistant-send"
          onClick={send}
          disabled={loading}
          style={{
            padding: "0 16px", borderRadius: 10, border: "none", cursor: "pointer",
            background: COLORS.gold, color: COLORS.bg, fontWeight: 700, fontSize: 14,
          }}
        >
          Envoyer
        </button>
      </div>
    </div>
  )
}
