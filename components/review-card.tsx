import { StarRating } from "./star-rating"
import { formatDateRelative } from "@/lib/date-utils"

interface ReviewCardProps {
  rating: number
  comment: string | null
  createdAt: Date | string
  reviewerName?: string
}

export function ReviewCard({ rating, comment, createdAt, reviewerName }: ReviewCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StarRating value={rating} readonly size="sm" />
          <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
        </div>
        <span className="text-sm text-muted-foreground">{formatDateRelative(createdAt)}</span>
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
