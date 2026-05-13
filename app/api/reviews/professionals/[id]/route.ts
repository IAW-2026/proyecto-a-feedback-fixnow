import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { db } from "@/lib/db"
import { validateServiceToken } from "@/lib/service-auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateServiceToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: professionalId } = await params
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)))
  const skip = (page - 1) * limit

  const [reviews, { _avg, _count }] = await Promise.all([
    db.review.findMany({
      where: { revieweeId: professionalId, revieweeType: "professional" },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.review.aggregate({
      where: { revieweeId: professionalId, revieweeType: "professional" },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ])

  if (_count.rating === 0) {
    return NextResponse.json({ error: "No reviews found" }, { status: 404 })
  }

  return NextResponse.json({
    professional_id: professionalId,
    average_rating: Number((_avg.rating ?? 0).toFixed(2)),
    total_reviews: _count.rating,
    reviews: reviews.map((r) => ({
      review_id: r.id,
      job_id: r.jobId,
      reviewer_id: r.reviewerId,
      rating: r.rating,
      comment: r.comment,
      created_at: r.createdAt,
    })),
  })
}
