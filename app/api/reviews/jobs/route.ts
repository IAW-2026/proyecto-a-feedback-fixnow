import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { db } from "@/lib/db"
import { withServiceAuth } from "@/lib/service-auth"

export const GET = withServiceAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)

  const page  = Math.max(1, Number(searchParams.get("page")  ?? 1))
  const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit") ?? 100)))
  const skip  = (page - 1) * limit

  const fromParam = searchParams.get("from")
  const fromDate  = fromParam ? new Date(fromParam) : undefined

  if (fromDate && isNaN(fromDate.getTime())) {
    return NextResponse.json({ error: "Parámetro 'from' inválido, se esperaba ISO8601" }, { status: 400 })
  }

  const where = {
    revieweeType: "professional" as const,
    status: "approved" as const,
    ...(fromDate && { createdAt: { gte: fromDate } }),
  }

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip,
      take: limit,
      select: { jobId: true, rating: true },
    }),
    db.review.count({ where }),
  ])

  return NextResponse.json({
    reviews: reviews.map((r) => ({ job_id: r.jobId, calificacion: r.rating })),
    total,
    page,
    limit,
  })
})
