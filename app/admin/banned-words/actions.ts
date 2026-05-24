"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/clerk"

export async function addBannedWord(formData: FormData) {
  await requireAdmin()

  const word = (formData.get("word") as string | null)?.trim().toLowerCase()
  if (!word || word.length < 2) return

  // upsert ignora silenciosamente si la palabra ya existe
  await db.bannedWord.upsert({
    where:  { word },
    update: {},
    create: { word },
  })

  revalidatePath("/admin/banned-words")
}

export async function deleteBannedWord(formData: FormData) {
  await requireAdmin()

  const id = formData.get("id") as string | null
  if (!id) return

  await db.bannedWord.delete({ where: { id } })

  revalidatePath("/admin/banned-words")
}
