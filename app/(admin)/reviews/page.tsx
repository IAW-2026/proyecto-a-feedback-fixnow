import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
import { Header } from "@/components/header"
import { ReviewCard } from "@/components/review-card"

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <header className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Panel de Moderación
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Últimas {reviews.length} reseñas del sistema
            </p>
          </header>

          {reviews.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">No hay reseñas registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id}>
                  <p className="mb-1 text-xs text-muted-foreground">
                    {review.revieweeType === "professional" ? "Cliente → Profesional" : "Profesional → Cliente"}
                    {" · "}job: {review.jobId}
                  </p>
                  <ReviewCard
                    rating={review.rating}
                    comment={review.comment}
                    createdAt={review.createdAt}
                    reviewerName={review.reviewerId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
