import { MessageSquareOff } from "lucide-react"

type StatusFilter = "all" | "pending" | "approved" | "rejected"
type TypeFilter   = "all" | "professional" | "client"

interface ReviewEmptyStateProps {
  status: StatusFilter
  type:   TypeFilter
}

export function ReviewEmptyState({ status, type }: ReviewEmptyStateProps) {
  const typeLabel =
    type === "professional" ? " de clientes sobre profesionales"
    : type === "client"     ? " de profesionales sobre clientes"
    : ""

  const messages: Record<StatusFilter, string> = {
    all:      `No hay reseñas${typeLabel} en el sistema`,
    pending:  `No hay reseñas pendientes${typeLabel}`,
    approved: `No hay reseñas aprobadas${typeLabel}`,
    rejected: `No hay reseñas rechazadas${typeLabel}`,
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <MessageSquareOff className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="font-display text-base font-semibold text-foreground">Sin reseñas</p>
      <p className="mt-1 text-sm text-muted-foreground">{messages[status]}</p>
    </div>
  )
}
