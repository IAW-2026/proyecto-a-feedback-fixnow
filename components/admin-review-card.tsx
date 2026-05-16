import { StarRating } from "./star-rating"
import { formatDateFull } from "@/lib/date-utils"

interface AdminReviewCardProps {
  id: string
  jobId: string
  reviewerId: string
  revieweeId: string
  revieweeType: "professional" | "client"
  rating: number
  comment: string | null
  createdAt: Date | string
}

function truncate(str: string, len = 16): string {
  return str.length > len ? str.slice(0, len) + "…" : str
}

export function AdminReviewCard({
  jobId,
  reviewerId,
  revieweeId,
  revieweeType,
  rating,
  comment,
  createdAt,
}: AdminReviewCardProps) {
  const isProfReview = revieweeType === "professional"

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Fila superior: badge + rating + fecha */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Badge de dirección */}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isProfReview
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            }`}
          >
            {isProfReview ? "Cliente → Profesional" : "Profesional → Cliente"}
          </span>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <StarRating value={rating} readonly size="sm" />
            <span className="text-sm font-semibold text-foreground">{rating}.0</span>
          </div>
        </div>

        <span className="text-xs text-muted-foreground">{formatDateFull(createdAt)}</span>
      </div>

      {/* Comentario */}
      <div className="mt-3 min-h-[2rem]">
        {comment ? (
          <p className="text-sm text-foreground leading-relaxed">{comment}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground">Sin comentario</p>
        )}
      </div>

      {/* Metadata: IDs */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3">
        <MetaField label="Job" value={jobId} />
        <MetaField label="Autor" value={reviewerId} />
        <MetaField label="Evaluado" value={revieweeId} />
      </div>
    </div>
  )
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}:</span>
      <code
        className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground font-mono"
        title={value}
      >
        {truncate(value, 18)}
      </code>
    </div>
  )
}
