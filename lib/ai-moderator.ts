import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
import type { ReviewStatus } from "@prisma/client"

export interface ModerationInput {
  rating: number
  comment: string | null
  revieweeType: "professional" | "client"
}

export interface ModerationResult {
  decision: ReviewStatus
  reason: string
}

const SYSTEM_PROMPT = `Eres un moderador de reseñas para una plataforma de servicios del hogar.
Tu tarea es analizar cada reseña y tomar una decisión de moderación.

Debes responder ÚNICAMENTE con un bloque JSON con esta forma exacta:
{"decision":"approved","reason":"..."}

Donde:
- "decision" es exactamente uno de: "approved", "rejected", "pending"
  - "approved": la reseña es auténtica, constructiva y cumple las normas
  - "rejected": la reseña contiene lenguaje abusivo, spam, información falsa o viola las normas
  - "pending": la reseña es ambigua o no tienes suficiente certeza para decidir
- "reason" es una explicación breve en español de tu decisión (máximo 2 oraciones)

Normas de moderación:
- Rechazar: insultos, palabras ofensivas, amenazas, información personal, spam, contenido irrelevante al servicio
- Aprobar: opiniones negativas legítimas están permitidas aunque el rating sea bajo
- Pendiente: cuando la reseña es muy corta, ambigua o el contexto no es claro

Responde SOLO con el JSON. Sin texto adicional.`

function buildUserMessage(input: ModerationInput): string {
  const type =
    input.revieweeType === "professional"
      ? "Cliente evaluando a un profesional"
      : "Profesional evaluando a un cliente"
  return `Tipo de reseña: ${type}
Puntuación: ${input.rating}/5
Comentario: ${input.comment ?? "(sin comentario)"}`
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const VALID_DECISIONS: ReviewStatus[] = ["approved", "rejected", "pending"]

export async function moderateReview(
  input: ModerationInput
): Promise<ModerationResult | null> {
  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash-lite"),
      system: SYSTEM_PROMPT,
      prompt: buildUserMessage(input),
    })

    const raw = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
    const parsed = JSON.parse(raw) as { decision: string; reason: string }

    if (!VALID_DECISIONS.includes(parsed.decision as ReviewStatus)) return null

    return {
      decision: parsed.decision as ReviewStatus,
      reason: parsed.reason,
    }
  } catch (err) {
    console.error("[ai-moderator] Error al moderar reseña:", err)
    return null
  }
}
