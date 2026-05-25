import { db } from "@/lib/db"

/**
 * Obtiene todas las palabras prohibidas desde la DB.
 */
export async function getBannedWords(): Promise<string[]> {
  const words = await db.bannedWord.findMany({
    select: { word: true },
  })
  return words.map((w) => w.word)
}

/**
 * Reemplaza cada aparición de las palabras prohibidas con asteriscos.
 * Uso exclusivo en respuestas de las APIs públicas.
 * Regex Unicode-aware para manejar tildes y caracteres del español.
 */
export function censorComment(
  comment: string | null,
  bannedWords: string[]
): string | null {
  if (!comment || bannedWords.length === 0) return comment

  let result = comment
  for (const word of bannedWords) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(`(?<![\\wÀ-ÿ])${escaped}(?![\\wÀ-ÿ])`, "gi")
    result = result.replace(regex, "*".repeat(word.length))
  }
  return result
}

/**
 * Devuelve segmentos tipados para renderizado con resaltado.
 * Uso exclusivo en el panel admin (Server Components).
 */
export function highlightBannedWords(
  comment: string,
  bannedWords: string[]
): Array<{ text: string; highlight: boolean }> {
  if (bannedWords.length === 0) return [{ text: comment, highlight: false }]

  const escaped = bannedWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi")
  const bannedSet = new Set(bannedWords.map((w) => w.toLowerCase()))

  return comment
    .split(pattern)
    .filter((p) => p.length > 0)
    .map((text) => ({ text, highlight: bannedSet.has(text.toLowerCase()) }))
}
