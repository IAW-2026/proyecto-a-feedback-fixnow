import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { db } from "@/lib/db"
import { withServiceAuth } from "@/lib/service-auth"

export const GET = withServiceAuth(async (
  _req: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) => {
  const { job_id } = await params

  const review = await db.review.findFirst({
    where: { jobId: job_id, revieweeType: "professional", status: "approved" },
    select: { rating: true },
  })

  if (!review) {
    return NextResponse.json({ error: "No review found for this job" }, { status: 404 })
  }

  return NextResponse.json({
    job_id,
    calificacion: review.rating,
  })
})
