import { StarRating } from "./star-rating"

interface RatingSummaryProps {
  averageRating: number
  totalReviews: number
  distribution?: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export function RatingSummary({ averageRating, totalReviews, distribution }: RatingSummaryProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
          <StarRating value={Math.round(averageRating)} readonly size="sm" />
          <p className="mt-1 text-sm text-muted-foreground">
            {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}
          </p>
        </div>

        {distribution && (
          <div className="flex-1 space-y-1">
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const count = distribution[stars]
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="w-3 text-xs text-muted-foreground">{stars}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-star rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs text-muted-foreground text-right">{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
