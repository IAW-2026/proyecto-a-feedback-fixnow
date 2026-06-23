import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { db } from "@/lib/db"
import { withServiceAuth } from "@/lib/service-auth"

export const GET = withServiceAuth(async (_req: NextRequest) => {
  const { _avg, _count } = await db.review.aggregate({
    where: { status: "approved" },
    _avg: { rating: true },
    _count: { rating: true },
  })

  return NextResponse.json({
    calificacion_promedio: Number((_avg.rating ?? 0).toFixed(2)),
    total_reseñas: _count.rating,
  })
})
