"use server"

import { updateTag, revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/clerk"
import { updateProfessionalRating } from "@/services/driver-app"
import { isAiModerationEnabled, setSetting } from "@/lib/settings"

export async function updateReviewStatus(formData: FormData) {
  await requireAdmin()

  const id     = formData.get("id") as string
  const status = formData.get("status") as "approved" | "rejected"

  if (!id || !["approved", "rejected"].includes(status)) return

  const reason =
    status === "approved"
      ? "Aprobada manualmente por el administrador."
      : "Rechazada manualmente por el administrador."

  const [review] = await Promise.all([
    db.review.update({ where: { id }, data: { status } }),
    db.moderationLog.create({
      data: { reviewId: id, decision: status, reason, decidedBy: "human" },
    }),
  ])

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

    await updateProfessionalRating(//hacer el PUT en profesional.
      review.revieweeId,
      Number((_avg.rating ?? 0).toFixed(2)),
      _count.rating,
    )
  }
}

export async function toggleAiModeration(): Promise<boolean> {
  await requireAdmin()
  const current = await isAiModerationEnabled()
  await setSetting("ai_moderation_enabled", current ? "false" : "true")
  revalidatePath("/admin/reviews")
  return !current
}
