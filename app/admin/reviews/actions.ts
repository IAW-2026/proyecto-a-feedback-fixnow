"use server"

import { updateTag } from "next/cache"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/clerk"
import { updateProfessionalRating } from "@/services/driver-app"

export async function updateReviewStatus(formData: FormData) {
  await requireAdmin()

  const id     = formData.get("id") as string
  const status = formData.get("status") as "approved" | "rejected"

  if (!id || !["approved", "rejected"].includes(status)) return

  // update retorna la reseña actualizada — evita un query extra para leer revieweeType
  const review = await db.review.update({
    where: { id },
    data:  { status },
  })

  // updateTag invalida el cache desde un Server Action (read-your-own-writes)
  updateTag("review-breakdown")

  // Solo actualizamos Driver App al aprobar reseñas de profesionales.
  // El promedio se calcula sobre reseñas aprobadas únicamente.
  if (status === "approved" && review.revieweeType === "professional") {
    const { _avg, _count } = await db.review.aggregate({
      where:  { revieweeId: review.revieweeId, revieweeType: "professional", status: "approved" },
      _avg:   { rating: true },//calculo de promedio por bd
      _count: { rating: true },
    })

    await updateProfessionalRating(
      review.revieweeId,
      Number((_avg.rating ?? 0).toFixed(2)),
      _count.rating,
    )
  }
}
