import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const role = user?.publicMetadata?.role as string | undefined
  if (role !== "admin") redirect("/not-authorized")
}

export async function getAuthUser() {
  const user = await currentUser()
  return user
}
