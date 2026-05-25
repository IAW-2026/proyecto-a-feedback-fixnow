import { StarRating } from "./star-rating"
import { formatDateFull } from "@/lib/date-utils"
import { updateReviewStatus } from "@/app/admin/reviews/actions"
import { highlightBannedWords } from "@/lib/word-filter"

type ReviewStatus = "pending" | "approved" | "rejected"

interface AdminReviewCardProps {
  id:               string
  jobId:            string
  reviewerId:       string
  revieweeId:       string
  revieweeType:     "professional" | "client"
  rating:           number
  comment:          string | null
  status:           ReviewStatus
  createdAt:        Date | string
  showStatusBadge?: boolean
  bannedWords:      string[]
}

const statusConfig: Record<ReviewStatus, { label: string; className: string }> = {
  pending:  { label: "Pendiente", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  approved: { label: "Aprobada",  className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "Rechazada", className: "bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400"   },
}

function truncate(str: string, len = 18): string {
  return str.length > len ? str.slice(0, len) + "…" : str
}

export function AdminReviewCard({
  id,
  jobId,
  reviewerId,
  revieweeId,
  revieweeType,
  rating,
  comment,
  status,
  createdAt,
  showStatusBadge = true,
  bannedWords,
}: AdminReviewCardProps) {
  const isProfReview = revieweeType === "professional"
  const sc = statusConfig[status]

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">

      {/* Fila superior: badges + rating + fecha */}
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

          {/* Badge de estado — se oculta cuando el filtro activo ya lo indica */}
          {showStatusBadge && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.className}`}>
              {sc.label}
            </span>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <StarRating value={rating} size="sm" />
            <span className="text-sm font-semibold text-foreground">{rating}.0</span>
          </div>
        </div>

        <span className="text-xs text-muted-foreground">{formatDateFull(createdAt)}</span>
      </div>

      {/* Comentario */}
      <div className="mt-3 min-h-8">
        {comment ? (
          <HighlightedComment comment={comment} bannedWords={bannedWords} />
        ) : (
          <p className="text-sm italic text-muted-foreground">Sin comentario</p>
        )}
      </div>

      {/* Metadata + acciones */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <MetaField label="Job"      value={jobId}      />
          <MetaField label="Autor"    value={reviewerId} />
          <MetaField label="Evaluado" value={revieweeId} />
        </div>

        {/* Botones de moderación — un solo form, el value del botón determina el status */}
        <form action={updateReviewStatus} className="flex items-center gap-2">
          <input type="hidden" name="id" value={id} />
          {status !== "approved" && (
            <button
              type="submit"
              name="status"
              value="approved"
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
            >
              Aprobar
            </button>
          )}
          {status !== "rejected" && (
            <button
              type="submit"
              name="status"
              value="rejected"
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              Rechazar
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

function HighlightedComment({
  comment,
  bannedWords,
}: {
  comment: string
  bannedWords: string[]
}) {
  const segments = highlightBannedWords(comment, bannedWords)
  return (
    <p className="text-sm text-foreground leading-relaxed">
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark
            key={i}
            className="rounded bg-amber-100 px-0.5 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </p>
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
        {truncate(value)}
      </code>
    </div>
  )
}
