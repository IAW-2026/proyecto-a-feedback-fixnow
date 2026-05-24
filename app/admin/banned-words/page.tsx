import { ShieldAlert, Trash2 } from "lucide-react"
import { db } from "@/lib/db"
import { Header } from "@/components/header"
import { addBannedWord, deleteBannedWord } from "./actions"

export const dynamic = "force-dynamic"

export default async function BannedWordsPage() {
  const bannedWords = await db.bannedWord.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl">

          <header className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Palabras Prohibidas
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Las palabras de esta lista se censuran automáticamente en las
              respuestas públicas de la API.
            </p>
          </header>

          {/* Formulario para agregar */}
          <form action={addBannedWord} className="mb-8 flex gap-2">
            <input
              type="text"
              name="word"
              required
              minLength={2}
              placeholder="Nueva palabra prohibida..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
            />
            <button
              type="submit"
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Agregar
            </button>
          </form>

          {/* Lista de palabras */}
          {bannedWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <ShieldAlert className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-display text-base font-semibold text-foreground">
                Sin palabras prohibidas
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Agregá palabras para que se censuren automáticamente en las reseñas.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {bannedWords.map((bw) => (
                <li
                  key={bw.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                  <span className="font-mono text-sm text-foreground">{bw.word}</span>
                  <form action={deleteBannedWord}>
                    <input type="hidden" name="id" value={bw.id} />
                    <button
                      type="submit"
                      aria-label={`Eliminar "${bw.word}"`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            {bannedWords.length} palabra{bannedWords.length !== 1 ? "s" : ""} en la lista
          </p>

        </div>
      </main>
    </div>
  )
}
