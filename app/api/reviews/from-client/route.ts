import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { z } from "zod"
import { db } from "@/lib/db"
import { withServiceAuth } from "@/lib/service-auth"
import { moderateReview } from "@/lib/ai-moderator"
import { updateProfessionalRating } from "@/services/driver-app"
import { isAiModerationEnabled } from "@/lib/settings"

const schema = z.object({
  job_id:          z.string().uuid(),
  client_id:       z.string(),
  professional_id: z.string(),
  rating:          z.number().int().min(1).max(5),
  comment:         z.string().optional(),
})

export const POST = withServiceAuth(async (req: NextRequest) => {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { job_id, client_id, professional_id, rating, comment } = parsed.data

  const existing = await db.review.findFirst({
    where: {
      reviewerId: client_id,
      jobId:      job_id,
      status:     { in: ["pending", "rejected"] },
    },
  })
  if (existing) {
    return NextResponse.json({ error: "Review already exists for this job" }, { status: 409 })
  }

  const review = await db.review.create({
    data: {
      jobId:        job_id,
      reviewerId:   client_id,
      revieweeId:   professional_id,
      revieweeType: "professional",
      rating,
      comment,
    },
  })

  const aiEnabled = await isAiModerationEnabled()
  const modResult = aiEnabled
    ? await moderateReview({
        rating:       review.rating,
        comment:      review.comment,
        revieweeType: review.revieweeType,
      })
    : null
  console.log(modResult);

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

    if (modResult.decision === "approved") {
      const { _avg, _count } = await db.review.aggregate({
        where:  { revieweeId: review.revieweeId, revieweeType: "professional", status: "approved" },
        _avg:   { rating: true },
        _count: { rating: true },
      })

      await updateProfessionalRating(
        review.revieweeId,
        Number((_avg.rating ?? 0).toFixed(2)),
        _count.rating,
      )
    }
  }

  return NextResponse.json(
    {
      review_id:       review.id,
      job_id:          review.jobId,
      client_id:       review.reviewerId,
      professional_id: review.revieweeId,
      rating:          review.rating,
      comment:         review.comment,
      created_at:      review.createdAt,
    },
    { status: 201 }
  )
})
