import { StarRating } from "./star-rating"

interface ReviewCardProps {
  rating: number
  comment: string | null
  createdAt: Date | string
  reviewerName?: string
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
}

export function ReviewCard({ rating, comment, createdAt, reviewerName }: ReviewCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StarRating value={rating} readonly size="sm" />
          <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
        </div>
        <span className="text-sm text-muted-foreground">{formatDate(createdAt)}</span>
      </div>
      {reviewerName && (
        <p className="mt-2 text-sm font-medium text-foreground">{reviewerName}</p>
      )}
      {comment && (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{comment}</p>
      )}
    </div>
  )
}
