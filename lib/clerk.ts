import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function requireAdmin() {
  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const role = user.publicMetadata?.role as string | undefined
  if (role !== "admin") redirect("/not-authorized")
}
