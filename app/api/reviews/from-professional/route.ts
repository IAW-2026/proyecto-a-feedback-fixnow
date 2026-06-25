import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { z } from "zod"
import { db } from "@/lib/db"
import { withServiceAuth } from "@/lib/service-auth"
import { moderateReview } from "@/lib/ai-moderator"

const schema = z.object({
  job_id: z.string().uuid(),
  professional_id: z.string(),
  client_id: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
})

export const POST = withServiceAuth(async (req: NextRequest) => {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { job_id, professional_id, client_id, rating, comment } = parsed.data

  const existing = await db.review.findUnique({
    where: { reviewerId_jobId: { reviewerId: professional_id, jobId: job_id } },
  })
  if (existing) {
    return NextResponse.json({ error: "Review already exists for this job" }, { status: 409 })
  }

  const review = await db.review.create({
    data: {
      jobId: job_id,
      reviewerId: professional_id,
      revieweeId: client_id,
      revieweeType: "client",
      rating,
      comment,
    },
  })

  const modResult = await moderateReview({
    rating:       review.rating,
    comment:      review.comment,
    revieweeType: review.revieweeType,
  })

  if (modResult !== null) {
    await Promise.all([
      db.review.update({ where: { id: review.id }, data: { status: modResult.decision } }),
      db.moderationLog.create({
        data: {
          reviewId:  review.id,
          decision:  modResult.decision,
          reason:    modResult.reason,
          decidedBy: "ai",
        },
      }),
    ])
  }

  return NextResponse.json(
    {
      review_id: review.id,
      job_id: review.jobId,
      professional_id: review.reviewerId,
      client_id: review.revieweeId,
      rating: review.rating,
      comment: review.comment,
      created_at: review.createdAt,
    },
    { status: 201 }
  )
})
