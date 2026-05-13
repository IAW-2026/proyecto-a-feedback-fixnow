import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function requireAdmin() {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role
  if (role !== "admin") redirect("/")
}

export async function getAuthUser() {
  const user = await currentUser()
  return user
}
