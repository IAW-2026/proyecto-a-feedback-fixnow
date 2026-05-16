/**
 * Formatea una fecha como texto relativo ("Hoy", "Hace 3 días", etc.)
 */
export function formatDateRelative(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
}

/**
 * Formatea una fecha con día, mes, año y hora exacta.
 */
export function formatDateFull(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
