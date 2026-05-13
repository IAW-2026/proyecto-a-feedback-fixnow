import { NextRequest } from "next/server"

export function validateServiceToken(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return false
  const token = authHeader.slice(7)
  return token === process.env.INTERNAL_API_SECRET
}
