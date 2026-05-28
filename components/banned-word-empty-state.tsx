import { ShieldAlert } from "lucide-react"

export function BannedWordEmptyState() {
  return (
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
  )
}
