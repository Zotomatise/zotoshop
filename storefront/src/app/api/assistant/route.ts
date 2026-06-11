// Proxy pass-through vers le service IA Python (assistant-ia, port 8100).
// AUCUNE logique IA ici : on transmet la requete au cerveau Python et on
// renvoie sa reponse. Evite le CORS et masque l'URL interne du service.
import { NextRequest, NextResponse } from "next/server"

const ASSISTANT_URL =
  process.env.ASSISTANT_URL || "http://assistant-ia:8100"

export async function POST(req: NextRequest) {
  const body = await req.json()
  try {
    const res = await fetch(`${ASSISTANT_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json(
      { answer: "Assistant indisponible pour le moment.", sources: [], error: String(e) },
      { status: 502 }
    )
  }
}
