"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { updateProfessionalRating } from "@/services/driver-app"

export type SimulateResult = {
  status: number
  body: unknown
}

// ─── POST: cliente reseña a profesional ───────────────────────────────────────

const fromClientSchema = z.object({
  job_id: z.string().uuid("job_id debe ser un UUID válido"),
  client_id: z.string().min(1, "client_id requerido"),
  professional_id: z.string().min(1, "professional_id requerido"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
})

export async function simulateFromClient(data: unknown): Promise<SimulateResult> {
  const parsed = fromClientSchema.safeParse(data)
  if (!parsed.success) {
    return { status: 422, body: { error: parsed.error.flatten() } }
  }

  const { job_id, client_id, professional_id, rating, comment } = parsed.data

  const existing = await db.review.findUnique({
    where: { reviewerId_jobId: { reviewerId: client_id, jobId: job_id } },
  })
  if (existing) {
    return { status: 409, body: { error: "Review already exists for this job" } }
  }

  const review = await db.review.create({
    data: { jobId: job_id, reviewerId: client_id, revieweeId: professional_id, revieweeType: "professional", rating, comment },
  })

  const { _avg, _count } = await db.review.aggregate({
    where: { revieweeId: professional_id, revieweeType: "professional" },
    _avg: { rating: true },
    _count: { rating: true },
  })

  await updateProfessionalRating(professional_id, Number((_avg.rating ?? 0).toFixed(2)), _count.rating)

  return {
    status: 201,
    body: {
      review_id: review.id,
      job_id: review.jobId,
      client_id: review.reviewerId,
      professional_id: review.revieweeId,
      rating: review.rating,
      comment: review.comment,
      created_at: review.createdAt,
    },
  }
}

// ─── POST: profesional reseña a cliente ───────────────────────────────────────

const fromProfessionalSchema = z.object({
  job_id: z.string().uuid("job_id debe ser un UUID válido"),
  professional_id: z.string().min(1, "professional_id requerido"),
  client_id: z.string().min(1, "client_id requerido"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
})

export async function simulateFromProfessional(data: unknown): Promise<SimulateResult> {
  const parsed = fromProfessionalSchema.safeParse(data)
  if (!parsed.success) {
    return { status: 422, body: { error: parsed.error.flatten() } }
  }

  const { job_id, professional_id, client_id, rating, comment } = parsed.data

  const existing = await db.review.findUnique({
    where: { reviewerId_jobId: { reviewerId: professional_id, jobId: job_id } },
  })
  if (existing) {
    return { status: 409, body: { error: "Review already exists for this job" } }
  }

  const review = await db.review.create({
    data: { jobId: job_id, reviewerId: professional_id, revieweeId: client_id, revieweeType: "client", rating, comment },
  })

  return {
    status: 201,
    body: {
      review_id: review.id,
      job_id: review.jobId,
      professional_id: review.reviewerId,
      client_id: review.revieweeId,
      rating: review.rating,
      comment: review.comment,
      created_at: review.createdAt,
    },
  }
}

// ─── GET: reseñas de un profesional ───────────────────────────────────────────

export async function simulateGetProfessional(
  userId: string,
  page: number,
  limit: number
): Promise<SimulateResult> {
  const skip = (page - 1) * limit

  const [reviews, { _avg, _count }] = await Promise.all([
    db.review.findMany({
      where: { revieweeId: userId, revieweeType: "professional" },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.review.aggregate({
      where: { revieweeId: userId, revieweeType: "professional" },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ])

  if (_count.rating === 0) {
    return { status: 404, body: { error: "No reviews found" } }
  }

  return {
    status: 200,
    body: {
      professional_id: userId,
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
    },
  }
}

// ─── GET: reseñas de un cliente ────────────────────────────────────────────────

export async function simulateGetClient(
  userId: string,
  page: number,
  limit: number
): Promise<SimulateResult> {
  const skip = (page - 1) * limit

  const [reviews, { _avg, _count }] = await Promise.all([
    db.review.findMany({
      where: { revieweeId: userId, revieweeType: "client" },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.review.aggregate({
      where: { revieweeId: userId, revieweeType: "client" },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ])

  if (_count.rating === 0) {
    return { status: 404, body: { error: "No reviews found" } }
  }

  return {
    status: 200,
    body: {
      client_id: userId,
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
    },
  }
}
