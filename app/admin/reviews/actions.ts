"use server"

import { updateTag } from "next/cache"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/clerk"

export async function updateReviewStatus(formData: FormData) {
  await requireAdmin()

  const id     = formData.get("id") as string
  const status = formData.get("status") as "approved" | "rejected"

  if (!id || !["approved", "rejected"].includes(status)) return

  await db.review.update({
    where: { id },
    data:  { status },
  })

  // updateTag invalida el cache desde un Server Action (read-your-own-writes)
  updateTag("review-breakdown")
}
